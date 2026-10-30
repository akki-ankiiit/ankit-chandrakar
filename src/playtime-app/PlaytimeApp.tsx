import { useEffect } from "react";
import Lenis from "lenis";

import { ImageTrail } from "./components/interactive/ImageTrail";
import { SnapCarousel } from "./components/interactive/SnapCarousel";
import { Flipbook } from "./components/interactive/Flipbook";
import { WaterRipple } from "./components/interactive/WaterRipple";
import { MemoryGallerySection } from "./components/sections/MemoryGallerySection";
import { DotBackgroundSection } from "./components/sections/DotBackgroundSection";
import { GlobeGallerySection } from "./components/sections/GlobeGallerySection";
import { TunnelGallerySection } from "./components/sections/TunnelGallerySection";
import { DockSection } from "./components/sections/DockSection";
import { PocketPlayerSection } from "./components/sections/PocketPlayerSection";

function App() {
  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    window.__playtimeLenis = lenis;

    return () => {
      lenis.destroy();
      if (window.__playtimeLenis === lenis) delete window.__playtimeLenis;
    };
  }, []);

  return (
    <div id="top" className="playtime-app min-h-screen w-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden relative font-sans selection:bg-[var(--color-accent-orange)] selection:text-white">
      <main className="flex flex-col w-full relative z-10">
        <div id="keep-moving"><ImageTrail /></div>
        <div id="works"><SnapCarousel /></div>
        <div id="flipbook"><Flipbook /></div>
        <div id="water-ripple"><WaterRipple /></div>
        <div id="tunnel-gallery"><TunnelGallerySection /></div>
        <div id="memory-gallery"><MemoryGallerySection /></div>
        <div id="dot-field"><DotBackgroundSection /></div>
        <div id="globe-gallery"><GlobeGallerySection /></div>
        <div id="dock"><DockSection /></div>
        <div id="pocket-vibes"><PocketPlayerSection /></div>
      </main>
    </div>
  );
}

export default App;
