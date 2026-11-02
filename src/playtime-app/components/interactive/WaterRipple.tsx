import { WaterRippleImage } from "./WaterRippleImage";

export const WaterRipple = () => {
  return (
    <section className="w-full h-[100vh] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center relative overflow-hidden">

      {/* The moving image itself is refracted by the fluid shader. */}
      <div className="absolute inset-0 z-0">
        <WaterRippleImage 
          src="/assets/video/fluid-poster.webp"
          videoSrc="/assets/video/fluid-web.mp4"
          pointerStrength={2.7}
          rippleIntensity={0.062}
          clickStrength={3}
          fit="cover"
          autoRipples={false}
        />
      </div>

      {/* Overlay Typography */}
      <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center text-center">
        <p className="text-[10px] md:text-xs tracking-[0.5em] text-white/80 uppercase mb-4 drop-shadow-md">
          Dive In
        </p>
        <h1 className="text-white text-6xl md:text-9xl tracking-widest font-serif drop-shadow-2xl opacity-95 uppercase">
          Fluid
        </h1>
        <p className="text-white/60 text-[10px] md:text-xs tracking-[0.3em] uppercase mt-6 drop-shadow-md">
          Interactive WebGL Experience
        </p>
      </div>

    </section>
  );
};
