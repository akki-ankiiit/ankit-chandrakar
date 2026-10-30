import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export interface WaterRippleImageProps {
  src: string;
  className?: string;
  fit?: "cover" | "contain" | "fill" | "center";
  rippleIntensity?: number; // 0.3-0.8 multiplier
  rippleSize?: number; // Controls initial disturbance radius (10-40px equivalent)
  damping?: number; // 2.5-3.5 per second
  waveSpeed?: number; // 300-500 pixels/second equivalent
  wavelength?: number; // 60-80 pixels
  pointerStrength?: number;
  clickStrength?: number;
  autoRipples?: boolean;
  rippleInterval?: number;
  interactive?: boolean;
  trigger?: "hover" | "click" | "both";
  overlayColor?: string;
  overlayOpacity?: number;
}

const MAX_RIPPLES = 8;

const RippleScene = ({
  src,
  fit,
  rippleIntensity = 0.04,
  rippleSize = 0.05,
  damping = 0.3,
  waveSpeed = 0.3,
  wavelength = 0.009,
  pointerStrength = 1.0,
  clickStrength = 1.5,
  autoRipples = false,
  rippleInterval = 1400,
  interactive = true,
  trigger = "both",
  overlayColor = "#000000",
  overlayOpacity = 0.0,
  isPaused,
  reducedMotion
}: WaterRippleImageProps & { isPaused: boolean; reducedMotion: boolean }) => {
  const { viewport } = useThree();
  const texture = useTexture(src);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Ripple state tracking (x, y, startTime, strength)
  const ripplesRef = useRef(new Array(MAX_RIPPLES).fill({ x: 0, y: 0, time: 0, strength: 0 }));
  const rippleIndexRef = useRef(0);

  const addRipple = (x: number, y: number, strength: number = 1.0) => {
    if (reducedMotion) return;
    const now = performance.now() / 1000;
    const newRipples = [...ripplesRef.current];
    newRipples[rippleIndexRef.current] = { x, y, time: now, strength };
    ripplesRef.current = newRipples;
    rippleIndexRef.current = (rippleIndexRef.current + 1) % MAX_RIPPLES;
  };

  useEffect(() => {
    if (!autoRipples || isPaused || reducedMotion) return;
    const interval = setInterval(() => {
      const rx = 0.2 + Math.random() * 0.6;
      const ry = 0.2 + Math.random() * 0.6;
      addRipple(rx, ry, clickStrength * (0.6 + Math.random() * 0.4));
    }, rippleInterval);
    return () => clearInterval(interval);
  }, [autoRipples, rippleInterval, clickStrength, isPaused, reducedMotion]);

  // Handle pointer down (Click)
  const handlePointerDown = (e: any) => {
    if (!interactive || (trigger !== "click" && trigger !== "both")) return;
    if (e.uv) {
      let force = 1.0;
      if (e.nativeEvent.pressure) force = e.nativeEvent.pressure * 2.0;
      addRipple(e.uv.x, e.uv.y, clickStrength * force);
    }
  };

  // Handle pointer move (Hover) - for fluid sheer and ripples
  const mouseInput = useRef({ x: -1, y: -1, strength: 0 });
  const lastMousePos = useRef({ x: -1, y: -1 });
  const mouseVelocity = useRef({ x: 0, y: 0 });
  const lastHoverTime = useRef(0);

  const handlePointerMove = (e: any) => {
    if (!interactive || (trigger !== "hover" && trigger !== "both")) return;
    if (e.uv) {
      mouseInput.current = { x: e.uv.x, y: e.uv.y, strength: pointerStrength };

      const now = performance.now();
      if (now - lastHoverTime.current > 150) {
        addRipple(e.uv.x, e.uv.y, pointerStrength * 0.3);
        lastHoverTime.current = now;
      }
    }
  };

  const uniforms = useMemo(() => {
    // Initialize Float32Arrays for uniforms
    const uRipplePositions = new Float32Array(MAX_RIPPLES * 2);
    const uRippleParams = new Float32Array(MAX_RIPPLES * 2); // [time, strength]

    return {
      uTexture: { value: texture },
      uRipplePositions: { value: uRipplePositions },
      uRippleParams: { value: uRippleParams },
      uCurrentTime: { value: 0 },
      uRippleIntensity: { value: rippleIntensity },
      uRippleSize: { value: rippleSize },
      uDamping: { value: damping },
      uWaveSpeed: { value: waveSpeed },
      uWavelength: { value: wavelength },
      uAspect: { value: 1.0 },
      uImageAspect: { value: 1.0 },
      uFit: { value: 0 },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uMouseStrength: { value: 0 },
      uOverlayColor: { value: new THREE.Color(overlayColor) },
      uOverlayOpacity: { value: overlayOpacity },
    };
  }, [texture, rippleIntensity, rippleSize, damping, waveSpeed, wavelength, overlayColor, overlayOpacity]);

  useFrame(() => {
    if (!materialRef.current || isPaused) return;

    const now = performance.now() / 1000;
    materialRef.current.uniforms.uCurrentTime.value = now;
    materialRef.current.uniforms.uAspect.value = viewport.width / viewport.height;

    if (texture && texture.image) {
      const img = texture.image as any;
      if (img.width && img.height) {
        materialRef.current.uniforms.uImageAspect.value = img.width / img.height;
      }
    }

    const fitMode = fit === "contain" ? 1 : fit === "fill" ? 2 : fit === "center" ? 3 : 0;
    materialRef.current.uniforms.uFit.value = fitMode;

    if (lastMousePos.current.x < 0) {
      lastMousePos.current.x = mouseInput.current.x;
      lastMousePos.current.y = mouseInput.current.y;
    }

    const prevX = lastMousePos.current.x;
    const prevY = lastMousePos.current.y;

    // Lerp factor of 0.08 creates roughly a 0.3s trailing delay at 60fps
    lastMousePos.current.x = THREE.MathUtils.lerp(lastMousePos.current.x, mouseInput.current.x, 0.1);
    lastMousePos.current.y = THREE.MathUtils.lerp(lastMousePos.current.y, mouseInput.current.y, 0.1);

    const dx = lastMousePos.current.x - prevX;
    const dy = lastMousePos.current.y - prevY;

    mouseVelocity.current.x = THREE.MathUtils.lerp(mouseVelocity.current.x, dx, 0.5);
    mouseVelocity.current.y = THREE.MathUtils.lerp(mouseVelocity.current.y, dy, 0.5);

    // Pass the delayed trailing mouse position to the shader sheer
    materialRef.current.uniforms.uMouse.value.set(lastMousePos.current.x, lastMousePos.current.y);
    materialRef.current.uniforms.uVelocity.value.set(mouseVelocity.current.x, mouseVelocity.current.y);
    materialRef.current.uniforms.uMouseStrength.value = mouseInput.current.strength;

    if (mouseInput.current.strength > 0) {
      mouseInput.current.strength = Math.max(0, mouseInput.current.strength - 0.05);
    }

    // Update ripple arrays
    const posArray = materialRef.current.uniforms.uRipplePositions.value as Float32Array;
    const paramArray = materialRef.current.uniforms.uRippleParams.value as Float32Array;

    ripplesRef.current.forEach((ripple, i) => {
      posArray[i * 2] = ripple.x;
      posArray[i * 2 + 1] = ripple.y;
      paramArray[i * 2] = ripple.time;
      paramArray[i * 2 + 1] = ripple.strength;
    });

    // Tell Three.js that the arrays have changed (if necessary)
    // @ts-ignore
    materialRef.current.uniforms.uRipplePositions.needsUpdate = true;
    // @ts-ignore
    materialRef.current.uniforms.uRippleParams.needsUpdate = true;
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform vec2 uRipplePositions[${MAX_RIPPLES}];
    uniform vec2 uRippleParams[${MAX_RIPPLES}]; // x: startTime, y: strength
    uniform float uCurrentTime;
    
    uniform float uRippleIntensity;
    uniform float uRippleSize;
    uniform float uDamping;
    uniform float uWaveSpeed;
    uniform float uWavelength;
    
    uniform float uAspect;
    uniform float uImageAspect;
    uniform int uFit;
    
    uniform vec2 uMouse;
    uniform vec2 uVelocity;
    uniform float uMouseStrength;
    
    uniform vec3 uOverlayColor;
    uniform float uOverlayOpacity;
    
    varying vec2 vUv;

    // Procedural sheer wake height function
    float getSheerHeight(vec2 posUv) {
        vec2 aspectUv = vec2(posUv.x * uAspect, posUv.y);
        vec2 aspectCenter = vec2(uMouse.x * uAspect, uMouse.y);
        vec2 delta = aspectUv - aspectCenter;
        float dist = length(delta);
        if (dist < 0.0001) return 0.0;
        
        vec2 vDir = normalize(uVelocity);
        vec2 lineDir = -vDir; // Trail directly behind the cursor
        
        float along = dot(delta, lineDir);
        float crossDist = length(delta - along * lineDir);
        
        float wakeShape;
        if (along < 0.0) {
            // Perfectly rounded leading tip (corner rounding ~40px)
            wakeShape = exp(-dist * dist * 625.0);
        } else {
            // Smooth straight trail behind
            wakeShape = exp(-crossDist * crossDist * 625.0);
        }
        
        float wakeFalloff = exp(-max(0.0, along) * 6.0); // Fades out slowly behind
        
        return wakeShape * wakeFalloff;
    }

    // Aspect-aware UV mapping
    vec2 getFitUv(vec2 uv) {
      float screenRatio = uAspect;
      float imageRatio = uImageAspect;
      vec2 newUv = uv;
      
      if (uFit == 0) { // cover
        if (screenRatio > imageRatio) {
          newUv.y = (uv.y - 0.5) * (imageRatio / screenRatio) + 0.5;
        } else {
          newUv.x = (uv.x - 0.5) * (screenRatio / imageRatio) + 0.5;
        }
      } else if (uFit == 1) { // contain
        if (screenRatio > imageRatio) {
          newUv.x = (uv.x - 0.5) * (screenRatio / imageRatio) + 0.5;
        } else {
          newUv.y = (uv.y - 0.5) * (imageRatio / screenRatio) + 0.5;
        }
      } else if (uFit == 3) { // center
          newUv = (uv - 0.5) * vec2(screenRatio, 1.0) + 0.5; 
      }
      return newUv;
    }

    void main() {
      vec2 uv = vUv;
      vec2 displacement = vec2(0.0);
      float totalHeight = 0.0;
      
      // Calculate ripples
      for(int i = 0; i < ${MAX_RIPPLES}; i++) {
        float startTime = uRippleParams[i].x;
        float strength = uRippleParams[i].y;
        
        if (startTime > 0.0 && strength > 0.0) {
          float t = uCurrentTime - startTime;
          
          if (t > 0.0 && t < 8.0) { // Max lifespan extended for slow waves
            // Correct distance for aspect ratio to make circles perfectly round
            vec2 aspectUv = vec2(uv.x * uAspect, uv.y);
            vec2 aspectCenter = vec2(uRipplePositions[i].x * uAspect, uRipplePositions[i].y);
            
            vec2 delta = aspectUv - aspectCenter;
            float dist = length(delta);
            
            // Formula: amplitude(t) = amplitude0 * e^(-damping * t)
            float amplitude = exp(-uDamping * t) * strength;
            
            // Normalized distance from the wave front
            float d = (dist - uWaveSpeed * t) / uWavelength;
            
            // A perfectly smooth, single-pulse fluid wave (derivative of Gaussian)
            // It creates exactly one crest and one trough, and never repeats.
            float k = 5.0;
            float wave = d * exp(-d * d * k) * 5.0;
            
            float height = wave * amplitude;
            
            // Analytical derivative for perfect refraction and specular normals
            float deriv = (1.0 - 2.0 * k * d * d) * exp(-k * d * d) * 5.0 * amplitude / uWavelength;
            
            if (dist > 0.0001) {
                vec2 dir = normalize(delta);
                displacement -= dir * deriv * uRippleIntensity * 0.001;
                totalHeight += height * uRippleIntensity;
            }
          }
        }
      }
      
      // Calculate fluid sheer for mouse hover
      float speed = length(uVelocity);
      if (uMouseStrength > 0.0 && speed > 0.0001) {
          float h = getSheerHeight(uv);
          float eps = 0.002;
          float hx = getSheerHeight(uv + vec2(eps, 0.0));
          float hy = getSheerHeight(uv + vec2(0.0, eps));
          
          vec2 grad = vec2(hx - h, hy - h) / eps;
          float sheerHeight = h * speed * 3.0 * uMouseStrength;
          
          // Using a proper multiplier (speed is tiny since it's UV per frame)
          // Scaled to 2.0 (0.5x of previous 4.0) for a slower, subtler sheer
          displacement -= grad * speed * 2.0 * uMouseStrength * uRippleIntensity;
          totalHeight += sheerHeight * uRippleIntensity;
      }
      
      // Calculate final UV with displacement
      vec2 finalUv = getFitUv(uv + displacement);
      finalUv = clamp(finalUv, 0.0, 1.0);
      
      // Sample texture with chromatic aberration offset based on displacement
      vec2 uvR = getFitUv(uv + displacement * 1.1);
      vec2 uvG = getFitUv(uv + displacement);
      vec2 uvB = getFitUv(uv + displacement * 0.9);
      
      float r = texture2D(uTexture, clamp(uvR, 0.0, 1.0)).r;
      float g = texture2D(uTexture, clamp(uvG, 0.0, 1.0)).g;
      float b = texture2D(uTexture, clamp(uvB, 0.0, 1.0)).b;
      
      vec4 color = vec4(r, g, b, 1.0);
      
      // Specular highlight removed to keep pure fluid without white shine
      
      // Apply overlay
      color.rgb = mix(color.rgb, uOverlayColor, uOverlayOpacity);
      
      gl_FragColor = color;
    }
  `;

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export const WaterRippleImage = ({
  src,
  className,
  fit = "cover",
  rippleIntensity,
  rippleSize,
  damping,
  waveSpeed,
  wavelength,
  pointerStrength,
  clickStrength,
  autoRipples = false,
  rippleInterval = 1400,
  interactive = true,
  trigger = "both",
  overlayColor = "#000000",
  overlayOpacity = 0.0,
}: WaterRippleImageProps) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={Math.max(1, Math.min(2, window.devicePixelRatio))} // Limit DPR for performance
      >
        <RippleScene
          src={src}
          fit={fit}
          rippleIntensity={rippleIntensity}
          rippleSize={rippleSize}
          damping={damping}
          waveSpeed={waveSpeed}
          wavelength={wavelength}
          pointerStrength={pointerStrength}
          clickStrength={clickStrength}
          autoRipples={autoRipples}
          rippleInterval={rippleInterval}
          interactive={interactive}
          trigger={trigger}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
          isPaused={false}
          reducedMotion={false}
        />
      </Canvas>
    </div>
  );
};
