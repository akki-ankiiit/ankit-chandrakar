
import { DotBackground } from "../interactive/DotBackground";

export const DotBackgroundSection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans border-t border-white/5 bg-[#002BFF]">
      {/* Interactive Canvas Background */}
      <DotBackground />

      {/* Foreground Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tight text-white mb-4 drop-shadow-lg text-center max-w-4xl px-4">
          OG Canvas
        </h2>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl text-center px-4 font-light">
          See the repulsion effect
        </p>
      </div>
    </section>
  );
};
