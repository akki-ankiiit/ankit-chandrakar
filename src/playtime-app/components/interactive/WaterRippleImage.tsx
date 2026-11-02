import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, events, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export interface WaterRippleImageProps {
  src: string;
  videoSrc?: string;
  className?: string;
  fit?: "cover" | "contain" | "fill" | "center";
  rippleIntensity?: number; // UV displacement gain; default .04
  rippleSize?: number; // Wave-front footprint in viewport-height units; default .05
  damping?: number; // Exponential decay per second; default .3
  waveSpeed?: number; // Viewport heights per second; default .3
  wavelength?: number; // Minimum crest width in UV units; default .009
  pointerStrength?: number; // Default 1
  clickStrength?: number; // Default 1.5
  autoRipples?: boolean;
  rippleInterval?: number; // Milliseconds; default 1400
  interactive?: boolean;
  trigger?: "hover" | "click" | "both";
  overlayColor?: string;
  overlayOpacity?: number;
}

const MAX_RIPPLES = 8;
type Media = { source: string; texture: THREE.VideoTexture };

function RendererLifecycle({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  return null;
}

// Canvas creation, texture loading and WebGL failures leave the DOM poster visible.
class RendererBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const RippleScene = ({
  src, fit = "cover", rippleIntensity = .04, rippleSize = .05, damping = .3,
  waveSpeed = .3, wavelength = .009, pointerStrength = 1, clickStrength = 1.5,
  autoRipples = false, rippleInterval = 1400, interactive = true, trigger = "both",
  overlayColor = "#000000", overlayOpacity = 0, paused, media, onReady,
}: WaterRippleImageProps & { paused: boolean; media: Media | null; onReady: (kind: string) => void }) => {
  const { viewport, invalidate } = useThree();
  const poster = useTexture(src);
  const material = useRef<THREE.ShaderMaterial>(null);
  const texture = media?.texture ?? poster;
  const rendered = useRef<THREE.Texture | null>(null);
  const ripples = useRef(Array.from({ length: MAX_RIPPLES }, () => ({ x: 0, y: 0, time: 0, strength: 0 })));
  const index = useRef(0);
  const pointer = useRef({ x: -1, y: -1, strength: 0, lastTime: 0, lastX: -1, lastY: -1 });
  const position = useRef(new THREE.Vector2(-1, -1));
  const velocity = useRef(new THREE.Vector2());
  const resetPointer = () => {
    pointer.current = { x: -1, y: -1, strength: 0, lastTime: 0, lastX: -1, lastY: -1 };
    position.current.set(-1, -1);
    velocity.current.set(0, 0);
  };
  const uniforms = useMemo(() => ({
    uTexture: { value: poster }, uVideo: { value: false },
    uPositions: { value: new Float32Array(MAX_RIPPLES * 2) },
    uParams: { value: new Float32Array(MAX_RIPPLES * 2) },
    uTime: { value: 0 }, uIntensity: { value: rippleIntensity },
    uWidth: { value: Math.max(wavelength, rippleSize * .35) },
    uDamping: { value: damping }, uSpeed: { value: waveSpeed },
    uAspect: { value: 1 }, uImageAspect: { value: 1 }, uFit: { value: 0 },
    uMouse: { value: new THREE.Vector2(-1, -1) }, uVelocity: { value: new THREE.Vector2() },
    uStrength: { value: 0 }, uOverlay: { value: new THREE.Color(overlayColor) },
    uOpacity: { value: overlayOpacity },
  }), [poster, rippleIntensity, rippleSize, wavelength, damping, waveSpeed, overlayColor, overlayOpacity]);

  useLayoutEffect(() => {
    if (!material.current) return;
    // Fiber keeps its own stable uniform wrappers; mutate the material, not prop wrappers.
    const u = material.current.uniforms as typeof uniforms;
    if (poster.colorSpace !== THREE.SRGBColorSpace) {
      poster.colorSpace = THREE.SRGBColorSpace;
      poster.needsUpdate = true;
    }
    u.uTexture.value = texture;
    u.uVideo.value = texture instanceof THREE.VideoTexture;
    const image = texture.image as HTMLImageElement | HTMLVideoElement;
    const width = image instanceof HTMLVideoElement ? image.videoWidth : image.naturalWidth || image.width;
    const height = image instanceof HTMLVideoElement ? image.videoHeight : image.naturalHeight || image.height;
    u.uImageAspect.value = width && height ? width / height : 1;
    u.uAspect.value = viewport.width / viewport.height;
    u.uFit.value = fit === "contain" ? 1 : fit === "fill" ? 2 : fit === "center" ? 3 : 0;
    // Demand mode still needs a correctly fitted first frame and live preference updates.
    if (paused) {
      resetPointer();
      ripples.current.forEach((ripple) => { ripple.strength = 0; });
      u.uStrength.value = 0;
      u.uParams.value.fill(0);
    }
    invalidate();
  }, [poster, texture, uniforms, viewport.width, viewport.height, fit, paused, invalidate]);

  const addRipple = (x: number, y: number, strength: number) => {
    if (paused) return;
    ripples.current[index.current] = { x, y, time: performance.now() / 1000, strength };
    index.current = (index.current + 1) % MAX_RIPPLES;
  };
  useEffect(() => {
    if (!autoRipples || paused) return;
    const timer = setInterval(() => addRipple(.2 + Math.random() * .6, .2 + Math.random() * .6, clickStrength), rippleInterval);
    return () => clearInterval(timer);
  }, [autoRipples, paused, clickStrength, rippleInterval]);

  const move = (event: ThreeEvent<PointerEvent>) => {
    if (paused || !interactive || trigger === "click" || !event.uv) return;
    const { x, y } = event.uv;
    const p = pointer.current;
    if (p.x < 0) position.current.set(x, y);
    p.x = x; p.y = y; p.strength = pointerStrength;
    const now = performance.now();
    const distance = Math.hypot((x - p.lastX) * viewport.aspect, y - p.lastY);
    if (now - p.lastTime >= 45 && distance >= .012) {
      addRipple(x, y, pointerStrength * .65);
      p.lastTime = now; p.lastX = x; p.lastY = y;
    }
  };
  const down = (event: ThreeEvent<PointerEvent>) => {
    if (paused || !interactive || trigger === "hover" || !event.uv) return;
    addRipple(event.uv.x, event.uv.y, clickStrength * Math.max(1, event.nativeEvent.pressure * 1.5));
  };
  useFrame((_, delta) => {
    if (paused || !material.current) return;
    const u = material.current.uniforms as typeof uniforms;
    const dt = Math.max(delta, .001);
    const p = pointer.current;
    const oldX = position.current.x, oldY = position.current.y;
    const response = 1 - Math.exp(-24 * dt);
    position.current.x += (p.x - oldX) * response;
    position.current.y += (p.y - oldY) * response;
    const smoothVelocity = 1 - Math.exp(-18 * dt);
    velocity.current.x += ((position.current.x - oldX) / Math.max(dt, .001) - velocity.current.x) * smoothVelocity;
    velocity.current.y += ((position.current.y - oldY) / Math.max(dt, .001) - velocity.current.y) * smoothVelocity;
    p.strength *= Math.exp(-4 * dt);
    u.uTime.value = performance.now() / 1000;
    u.uMouse.value.copy(position.current);
    u.uVelocity.value.copy(velocity.current);
    u.uStrength.value = p.strength;
    ripples.current.forEach((ripple, i) => {
      u.uPositions.value[i * 2] = ripple.x;
      u.uPositions.value[i * 2 + 1] = ripple.y;
      u.uParams.value[i * 2] = ripple.time;
      u.uParams.value[i * 2 + 1] = ripple.strength;
    });
  });
  return <mesh scale={[viewport.width, viewport.height, 1]} onPointerMove={move} onPointerDown={down}
    onPointerOut={resetPointer} onPointerLeave={resetPointer} onPointerUp={resetPointer} onPointerCancel={resetPointer}
    onAfterRender={() => {
      if (rendered.current === texture) return;
      rendered.current = texture;
      onReady(media ? "video" : "poster");
    }}>
    <planeGeometry args={[1, 1]} />
    <shaderMaterial ref={material} uniforms={uniforms} toneMapped={false} vertexShader={`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
    `} fragmentShader={`
      uniform sampler2D uTexture;
      uniform bool uVideo;
      uniform vec2 uPositions[${MAX_RIPPLES}], uParams[${MAX_RIPPLES}];
      uniform float uTime, uIntensity, uWidth, uDamping, uSpeed, uAspect, uImageAspect, uStrength, uOpacity;
      uniform int uFit;
      uniform vec2 uMouse, uVelocity;
      uniform vec3 uOverlay;
      varying vec2 vUv;
      vec2 fitUv(vec2 uv) {
        float ratio = uAspect / uImageAspect;
        if (uFit == 0) uv = (uv - .5) * vec2(min(ratio, 1.), min(1. / ratio, 1.)) + .5;
        else if (uFit == 1) uv = (uv - .5) * vec2(max(ratio, 1.), max(1. / ratio, 1.)) + .5;
        else if (uFit == 3) uv = (uv - .5) * vec2(uAspect, 1.) + .5;
        return uv;
      }
      float wake(vec2 uv) {
        vec2 velocity = uVelocity * vec2(uAspect, 1.);
        float speed = length(velocity);
        if (speed < .0001) return 0.;
        vec2 delta = (uv - uMouse) * vec2(uAspect, 1.);
        vec2 direction = -velocity / speed;
        float along = dot(delta, direction);
        float crossDistance = length(delta - max(along, 0.) * direction);
        return exp(-crossDistance * crossDistance / .0036) * exp(-max(along, 0.) * 8.);
      }
      void main() {
        vec2 offset = vec2(0.);
        for (int i = 0; i < ${MAX_RIPPLES}; i++) {
          float t = uTime - uParams[i].x;
          if (t > 0. && t < 8. && uParams[i].y > 0.) {
            vec2 delta = (vUv - uPositions[i]) * vec2(uAspect, 1.);
            float distance = length(delta);
            float d = (distance - uSpeed * t) / uWidth;
            // Outside the narrow crest the Gaussian is negligible; avoid costly exponentials.
            if (abs(d) < 3.5) {
              float slope = (1. - 2. * d * d) * exp(-d * d);
              offset -= delta / max(distance, .0001) * slope * exp(-uDamping * t)
                * uParams[i].y * uIntensity * .32 / vec2(uAspect, 1.);
            }
          }
        }
        float speed = min(length(uVelocity), 1.5);
        if (uStrength > .001 && speed > .0001) {
          float h = wake(vUv);
          vec2 gradient = vec2(wake(vUv + vec2(.002, 0.)) - h, wake(vUv + vec2(0., .002)) - h) / .002;
          offset -= gradient * speed * uStrength * uIntensity * .025;
        }
        // Smoothly bound combined wakes, then fade at edges to prevent stretched clamp bands.
        offset = offset / (1. + length(offset) / .035);
        vec2 edge = smoothstep(vec2(0.), vec2(.07), vUv) * smoothstep(vec2(0.), vec2(.07), 1. - vUv);
        offset *= edge.x * edge.y;
        vec2 mapped = fitUv(vUv + offset);
        vec3 color = texture2D(uTexture, clamp(mapped, .001, .999)).rgb;
        if (uFit == 1 && (mapped.x < 0. || mapped.x > 1. || mapped.y < 0. || mapped.y > 1.)) discard;
        // Video uploads use RGBA8; unlike sRGB image textures they need explicit decoding.
        if (uVideo) color = sRGBTransferEOTF(vec4(color, 1.)).rgb;
        gl_FragColor = vec4(mix(color, uOverlay, uOpacity), 1.);
        #include <colorspace_fragment>
      }
    `} />
  </mesh>;
};

export const WaterRippleImage = (props: WaterRippleImageProps) => {
  const { src, videoSrc, className, fit = "cover" } = props;
  const container = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [media, setMedia] = useState<Media | null>(null);
  const [ready, setReady] = useState({ source: "", kind: "poster" });
  const [rendererFailed, setRendererFailed] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const failRenderer = useCallback(() => setRendererFailed(true), []);
  const playback = useRef<() => void>(() => {});
  const shouldPlay = useRef(false);
  shouldPlay.current = active && !reduced && !rendererFailed;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = typeof IntersectionObserver === "undefined";
    const sync = () => { setActive(visible && !document.hidden); setReduced(query.matches); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (container.current) observer?.observe(container.current);
    query.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { observer?.disconnect(); query.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    let disposed = false, blocked = false, pending = false, interrupted = false;
    let texture: THREE.VideoTexture | null = null;
    let frame: number | undefined;
    setMedia(null);
    setMediaFailed(false);
    const bindFrame = () => {
      if (disposed || video.readyState < 2 || !video.videoWidth || texture) return;
      texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      setMedia({ source: videoSrc, texture });
    };
    const decoded = () => {
      if (video.requestVideoFrameCallback) {
        if (frame === undefined) frame = video.requestVideoFrameCallback(() => { frame = undefined; bindFrame(); });
      } else bindFrame();
    };
    const fail = () => {
      if (disposed) return;
      blocked = true; video.pause(); setMediaFailed(true);
    };
    const sync = () => {
      if (disposed) return;
      if (!shouldPlay.current || blocked) {
        if (pending) interrupted = true;
        video.pause();
      } else if (video.paused && !pending) {
        pending = true; interrupted = false;
        video.play().then(() => {
          // An old source/StrictMode session must not pause the replacement session.
          // Its own cleanup has already stopped playback and released the source.
          if (disposed) return;
          if (!shouldPlay.current || blocked) video.pause();
        }).catch((error: unknown) => {
          if (disposed) return;
          // Only an interrupted AbortError is eligible for one reconciliation.
          if (!(error instanceof DOMException) || error.name !== "AbortError" || !interrupted) fail();
        }).finally(() => {
          const reconcile = interrupted && !blocked;
          pending = false; interrupted = false;
          if (!disposed && reconcile && shouldPlay.current) sync();
        });
      }
    };
    playback.current = sync;
    video.addEventListener("loadeddata", decoded);
    video.addEventListener("error", fail);
    video.src = videoSrc;
    video.load();
    sync();
    return () => {
      disposed = true;
      playback.current = () => {};
      video.removeEventListener("loadeddata", decoded);
      video.removeEventListener("error", fail);
      if (frame !== undefined) video.cancelVideoFrameCallback(frame);
      texture?.dispose();
      video.pause(); video.removeAttribute("src"); video.load();
    };
  }, [videoSrc]);
  useEffect(() => { playback.current(); }, [active, reduced, rendererFailed]);

  const currentMedia = !reduced && !mediaFailed && media?.source === videoSrc ? media : null;
  const paused = !active || reduced || rendererFailed;
  return <div ref={container} className={className} aria-busy={!rendererFailed && ready.source !== src}
    data-water-ready={rendererFailed || ready.source === src} data-fluid-media={rendererFailed ? "fallback" : ready.kind}
    data-fluid-active={active} data-fluid-frameloop={paused ? "demand" : "always"}
    style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", touchAction: "pan-y", backgroundImage: `url("${src}")`, backgroundSize: fit === "fill" ? "100% 100%" : fit === "center" ? "auto" : fit, backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
    {videoSrc && <video ref={videoRef} data-fluid-video muted loop playsInline preload="metadata" hidden aria-hidden="true" />}
    <RendererBoundary onFailure={failRenderer}>
      {!rendererFailed && <Canvas frameloop={paused ? "demand" : "always"} camera={{ position: [0, 0, 1] }}
        style={{ touchAction: "pan-y" }} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={Math.max(1, Math.min(1.5, window.devicePixelRatio))}
        fallback={<span hidden />} onCreated={({ gl }) => { gl.domElement.style.touchAction = "pan-y"; }} events={(state) => ({
          ...events(state),
          // offsetX/Y can be retargeted to the shadow host. Client coordinates stay reliable.
          compute: (event, current) => {
            const rect = current.gl.domElement.getBoundingClientRect();
            current.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
            current.raycaster.setFromCamera(current.pointer, current.camera);
          },
        })}>
        <RendererLifecycle onFailure={failRenderer} />
        <Suspense fallback={null}><RippleScene {...props} paused={paused} media={currentMedia}
          onReady={(kind) => setReady({ source: src, kind })} /></Suspense>
      </Canvas>}
    </RendererBoundary>
  </div>;
};
