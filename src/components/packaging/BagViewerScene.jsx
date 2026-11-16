import { Component, Suspense, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Lightformer, useGLTF, useProgress } from '@react-three/drei';
import { Box3, MathUtils, NeutralToneMapping, Vector3 } from 'three';

// Every model is normalised to this height (scene units) and centred on the origin,
// so the K-Series (50 cm) and BONDURE (63 cm) bags frame the same way.
const BAG_HEIGHT = 1.6;
const FOV = 30;
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const EPS = 0.0001;

// Studio lighting, tuned so white paper stays just below clipping and printed type keeps its contrast.
const LIGHT = { exposure: 1, hemi: 0.4, head: 0.7, key: 0.7, env: 0.45 };

// camera-controls: azimuth 0 looks at the +Z face (the front of every bag), positive azimuth orbits towards +X.
const VIEWS = {
  front: { azimuth: 0, polar: HALF_PI, face: 'front' },
  back: { azimuth: Math.PI, polar: HALF_PI, face: 'front' },
  left: { azimuth: -HALF_PI, polar: HALF_PI, face: 'side' },
  right: { azimuth: HALF_PI, polar: HALF_PI, face: 'side' },
  top: { azimuth: 0, polar: EPS, face: 'top' },
  home: { azimuth: MathUtils.degToRad(-28), polar: MathUtils.degToRad(80), face: 'home' },
};

const useModel = (src) => useGLTF(src, false, true); // meshopt on, Draco off

// GLTF scenes are cached globally and R3F never disposes primitives, so free a model's GPU memory and cache
// entry once nothing shows it. Deferred so StrictMode's unmount/remount in development doesn't drop a live model.
const mounts = new Map();
function retain(src, scene) {
  mounts.set(src, (mounts.get(src) || 0) + 1);
  return () => {
    mounts.set(src, mounts.get(src) - 1);
    setTimeout(() => {
      if (mounts.get(src) > 0) return;
      mounts.delete(src);
      scene.traverse((object) => {
        object.geometry?.dispose();
        [object.material].flat().filter(Boolean).forEach((material) => {
          Object.values(material).forEach((value) => { if (value?.isTexture) value.dispose(); });
          material.dispose();
        });
      });
      useGLTF.clear(src);
    }, 0);
  };
}

// Print-legibility tuning, applied once per cached scene: sharper artwork at grazing angles,
// less glossy glare over the type, and a softer weave normal map so it doesn't break up small text.
function tuneMaterials(scene, maxAnisotropy) {
  if (scene.userData.bvTuned) return;
  scene.userData.bvTuned = true;
  scene.traverse((object) => {
    [object.material].flat().filter(Boolean).forEach((material) => {
      if (material.map) {
        material.map.anisotropy = maxAnisotropy;
        material.map.needsUpdate = true;
        if (material.normalScale) material.normalScale.multiplyScalar(0.5);
      }
      if ('specularIntensity' in material) material.specularIntensity = Math.min(material.specularIntensity, 0.3);
      if ('envMapIntensity' in material) material.envMapIntensity = 0.8;
      if ('roughness' in material) material.roughness = Math.max(material.roughness, 0.75);
    });
  });
}

// A soft light that follows the camera, so whichever face you turn to (back, sides, top) is evenly lit.
function Headlight() {
  const light = useRef(null);
  const { camera } = useThree();
  useFrame(() => { light.current?.position.copy(camera.position); });
  return <directionalLight ref={light} intensity={LIGHT.head} />;
}

function Bag({ src, onSize }) {
  const { scene } = useModel(src);
  const gl = useThree((state) => state.gl);
  useMemo(() => tuneMaterials(scene, gl.capabilities.getMaxAnisotropy()), [scene, gl]);
  const { scale, offset, size } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const dims = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const s = BAG_HEIGHT / dims.y;
    return { scale: s, offset: centre.multiplyScalar(-1), size: dims.multiplyScalar(s) };
  }, [scene]);

  useLayoutEffect(() => { onSize(size); }, [onSize, size]);
  useEffect(() => retain(src, scene), [src, scene]);

  // Offset lives on a wrapper so the cached scene object itself is never moved.
  return (
    <group scale={scale}>
      <group position={offset}><primitive object={scene} /></group>
    </group>
  );
}

// Loads the requested model off-screen; the visible bag only swaps once it is ready, so the old one stays up meanwhile.
function Preloader({ src, onReady }) {
  useModel(src);
  useEffect(() => { onReady(src); }, [src, onReady]);
  return null;
}

class LoadBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Rig({ apiRef, autoRotate, onInteract, size, wheelZoom }) {
  const controls = useRef(null);
  const { camera, gl, size: viewport } = useThree();
  const dragging = useRef(false);
  // The last preset view; cleared once the visitor moves the camera, so refits never undo their framing.
  const preset = useRef('home');

  // Distance that fits a w × h silhouette in the current viewport, with breathing room.
  const fit = (w, h, pad = 1.22) => {
    const vFov = MathUtils.degToRad(FOV);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (viewport.width / viewport.height));
    return Math.max(h / 2 / Math.tan(vFov / 2), w / 2 / Math.tan(hFov / 2)) * pad;
  };

  const distanceFor = (face) => {
    const { x, y, z } = size.current;
    if (face === 'side') return fit(z, y) + x / 2;
    if (face === 'top') return fit(x, z) + y / 2;
    if (face === 'home') return fit(Math.hypot(x, z), y, 1.32) + z / 2;
    return fit(x, y) + z / 2;
  };

  const goTo = (name, smooth = true) => {
    const c = controls.current;
    const view = VIEWS[name];
    if (!c || !view) return;
    preset.current = name;
    // Auto-rotate and drags wind the azimuth up; take the shortest way round to the preset.
    c.normalizeRotations();
    const azimuth = view.azimuth + TAU * Math.round((c.azimuthAngle - view.azimuth) / TAU);
    // Aim slightly below centre so the bag clears the toolbar along the bottom edge.
    c.moveTo(0, view.face === 'top' ? 0 : -0.1, 0, smooth);
    c.rotateTo(azimuth, view.polar, smooth);
    c.dollyTo(distanceFor(view.face), smooth);
  };

  const refit = (smooth) => {
    if (preset.current) controls.current?.dollyTo(distanceFor(VIEWS[preset.current].face), smooth);
  };

  useImperativeHandle(apiRef, () => ({
    view: (name) => goTo(name),
    refit: () => refit(true),
    zoom: (direction) => {
      const c = controls.current;
      preset.current = null;
      if (c) c.dollyTo(MathUtils.clamp(c.distance * (direction > 0 ? 0.78 : 1.28), c.minDistance, c.maxDistance), true);
    },
    rotate: (azimuth, polar = 0) => { preset.current = null; controls.current?.rotate(azimuth, polar, true); },
    pan: (x, y) => { preset.current = null; controls.current?.truck(x, y, true); },
  }));

  useEffect(() => {
    const c = controls.current;
    if (!c) return undefined;
    c.minDistance = 1.1;
    c.maxDistance = 9;
    c.smoothTime = 0.35;
    c.draggingSmoothTime = 0.12;
    c.setBoundary(new Box3(new Vector3(-1.2, -1.2, -1.2), new Vector3(1.2, 1.2, 1.2)));
    goTo('home', false);
    const start = () => { dragging.current = true; preset.current = null; onInteract(); };
    const end = () => { dragging.current = false; };
    c.addEventListener('controlstart', start);
    c.addEventListener('controlend', end);
    // Shift + left-drag moves the bag (truck) for trackpads and mice without a right button.
    const { ACTION } = c.constructor;
    const shift = (event) => { c.mouseButtons.left = event.shiftKey ? ACTION.TRUCK : ACTION.ROTATE; };
    const unshift = () => { c.mouseButtons.left = ACTION.ROTATE; };
    window.addEventListener('keydown', shift);
    window.addEventListener('keyup', shift);
    window.addEventListener('blur', unshift);
    return () => {
      c.removeEventListener('controlstart', start);
      c.removeEventListener('controlend', end);
      window.removeEventListener('keydown', shift);
      window.removeEventListener('keyup', shift);
      window.removeEventListener('blur', unshift);
    };
    // goTo reads refs and the viewport; it only needs to run once the controls exist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, onInteract]);

  // Wheel zoom only once the visitor engages the viewer, so scrolling past it still scrolls the page.
  useEffect(() => {
    const c = controls.current;
    if (!c) return undefined;
    c.mouseButtons.wheel = wheelZoom ? c.constructor.ACTION.DOLLY : c.constructor.ACTION.NONE;
    if (!wheelZoom) return undefined;
    const onWheel = () => { preset.current = null; onInteract(); };
    gl.domElement.addEventListener('wheel', onWheel, { passive: true });
    return () => gl.domElement.removeEventListener('wheel', onWheel);
  }, [wheelZoom, gl, onInteract]);

  // Keep untouched preset framing correct when the stage changes size (rotation, responsive layouts).
  useEffect(() => { refit(false); }, [viewport.width, viewport.height]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (autoRotate && !dragging.current) controls.current?.rotate(delta * 0.45, 0, false);
  });

  return <CameraControls ref={controls} makeDefault />;
}

function Progress() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return <div className="bv-loading" role="status"><span className="bv-spinner" aria-hidden="true" />Loading 3D bag… {Math.round(progress)}%</div>;
}

export default function BagViewerScene({ src, apiRef, autoRotate, onInteract, active, wheelZoom }) {
  const size = useRef(new Vector3(1.2, BAG_HEIGHT, 0.35));
  const [shown, setShown] = useState(null);
  const [failed, setFailed] = useState(null);
  const onSize = useRef((value) => { size.current = value; apiRef.current?.refit(); }).current;
  const onReady = useRef((ready) => setShown(ready)).current;

  return (
    <>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ fov: FOV, near: 0.05, far: 50, position: [0, 0, 5] }}
        // Khronos PBR Neutral keeps printed colours and white paper true, unlike ACES which greys them out.
        gl={{ antialias: true, toneMapping: NeutralToneMapping, toneMappingExposure: LIGHT.exposure }}
      >
        <hemisphereLight args={['#ffffff', '#d8d4c4', LIGHT.hemi]} />
        <Headlight />
        <directionalLight position={[2.5, 4, 3]} intensity={LIGHT.key} />
        {/* Even studio box on every side, so no face falls into shadow and reflections stay soft. */}
        <Environment resolution={256} environmentIntensity={LIGHT.env}>
          <Lightformer form="rect" intensity={1.4} position={[0, 1, 5]} scale={[10, 6]} />
          <Lightformer form="rect" intensity={1.4} position={[0, 1, -5]} rotation-y={Math.PI} scale={[10, 6]} />
          <Lightformer form="rect" intensity={1.2} position={[-5, 1, 0]} rotation-y={HALF_PI} scale={[10, 6]} />
          <Lightformer form="rect" intensity={1.2} position={[5, 1, 0]} rotation-y={-HALF_PI} scale={[10, 6]} />
          <Lightformer form="rect" intensity={1.6} position={[0, 5, 0]} rotation-x={HALF_PI} scale={[10, 10]} />
        </Environment>
        <LoadBoundary key={src} onError={() => { useGLTF.clear(src); setFailed(src); }}>
          <Suspense fallback={null}><Preloader src={src} onReady={onReady} /></Suspense>
        </LoadBoundary>
        {shown && <Suspense fallback={null}><Bag src={shown} onSize={onSize} /></Suspense>}
        <ContactShadows position={[0, -BAG_HEIGHT / 2 - 0.005, 0]} opacity={0.42} scale={4} blur={2.4} far={1.2} resolution={512} />
        <Rig apiRef={apiRef} autoRotate={autoRotate} onInteract={onInteract} size={size} wheelZoom={wheelZoom} />
      </Canvas>
      {failed === src ? <p className="bv-message" role="alert">This bag could not load. Check your connection and pick it again.</p> : <Progress />}
    </>
  );
}
