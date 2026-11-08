import { lazy, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";

import { ImageTrail } from "./components/interactive/ImageTrail";
import { SnapCarousel } from "./components/interactive/SnapCarousel";
import { Flipbook } from "./components/interactive/Flipbook";
import { DeferredExperiment } from "./components/DeferredExperiment";
import { MemoryGallerySection } from "./components/sections/MemoryGallerySection";
import { DotBackgroundSection } from "./components/sections/DotBackgroundSection";
import { DockSection } from "./components/sections/DockSection";
import { FlowerTrailSection } from "./components/sections/FlowerTrailSection";
import { PocketPlayerSection } from "./components/sections/PocketPlayerSection";
// import { TypewriterSection } from "./components/sections/TypewriterSection";

const WaterRipple = lazy(() => import('./components/interactive/WaterRipple').then(module => ({ default: module.WaterRipple })));
// const GlobeGallerySection = lazy(() => import('./components/sections/GlobeGallerySection').then(module => ({ default: module.GlobeGallerySection })));
// const TunnelGallerySection = lazy(() => import('./components/sections/TunnelGallerySection').then(module => ({ default: module.TunnelGallerySection })));

function App() {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};
    const syncMotion = () => {
      dispose();
      dispose = () => {};
      if (motionQuery.matches) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      let frame = 0;
      function raf(time: number) {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      }
      const syncVisibility = () => {
        cancelAnimationFrame(frame);
        if (!document.hidden) frame = requestAnimationFrame(raf);
      };
      syncVisibility();
      document.addEventListener('visibilitychange', syncVisibility);
      const previousLenis = window.__playtimeLenis;
      window.__playtimeLenis = lenis;
      dispose = () => {
        cancelAnimationFrame(frame);
        document.removeEventListener('visibilitychange', syncVisibility);
        lenis.destroy();
        if (window.__playtimeLenis === lenis) {
          if (previousLenis) window.__playtimeLenis = previousLenis;
          else delete window.__playtimeLenis;
        }
      };
    };
    syncMotion();
    motionQuery.addEventListener('change', syncMotion);
    return () => {
      motionQuery.removeEventListener('change', syncMotion);
      dispose();
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('playtime-ready'));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <div id="top" className="playtime-app min-h-screen w-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden relative font-sans selection:bg-[var(--color-accent-orange)] selection:text-white">
      <div className="flex flex-col w-full relative z-10">
        <DeferredExperiment id="flower-trail" label="Flower trail" height="76vh" background="#F7F7F7"><FlowerTrailSection /></DeferredExperiment>
        {/* <DeferredExperiment id="typewriter" label="Typewriter" height="760px" background="#F7F7F7"><TypewriterSection /></DeferredExperiment> */}
        <div id="pocket-vibes"><PocketPlayerSection /></div>
        <DeferredExperiment id="keep-moving" label="Image trail" background="#F7F7F7"><ImageTrail /></DeferredExperiment>
        <DeferredExperiment id="works" label="Project carousel" height="max(90vh, 692px)" background="#f4f4f4"><SnapCarousel /></DeferredExperiment>
        <DeferredExperiment id="flipbook" label="Flipbook" height="max(100vh, 776px)" background="#e5e5e5"><Flipbook /></DeferredExperiment>
        <DeferredExperiment id="water-ripple" label="Water ripple"><WaterRipple /></DeferredExperiment>
        {/* <DeferredExperiment id="tunnel-gallery" label="Tunnel gallery" background="#000"><TunnelGallerySection /></DeferredExperiment> */}
        <DeferredExperiment id="memory-gallery" label="Memory gallery" background="#400000"><MemoryGallerySection /></DeferredExperiment>
        <DeferredExperiment id="dot-field" label="Dot field" background="#002BFF"><DotBackgroundSection /></DeferredExperiment>
        {/* <DeferredExperiment id="globe-gallery" label="Globe gallery" background="#fff"><GlobeGallerySection /></DeferredExperiment> */}
        <DeferredExperiment id="dock" label="Dock" height="60vh" background="#0a0a0b"><DockSection /></DeferredExperiment>
      </div>
    </div>
    </MotionConfig>
  );
}

export default App;
