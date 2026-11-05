import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const baseImages = [
  "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592355591829-aaae33fcff1d?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523510468197-455cc987be86?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1569154107747-fb00e3b3430d?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596868801151-5d26796963b7?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536195892759-c8a3c8e1945e?q=80&w=400&auto=format&fit=crop",
];

// Create a larger pool to avoid recycling images too quickly
const images = [...baseImages, ...baseImages, ...baseImages, ...baseImages];

// Footer-only variant: tiny flat retro daisies drawn as inline SVG (no network, no assets).
// Colours are sampled from public/references/flower-cursor-reference.png. Tune here.
const FLOWER = {
  sizeMin: 40, // px, rendered diameter range (average 52)
  sizeMax: 64,
  lifeMin: 0.95, // seconds (average 1.1)
  lifeMax: 1.25,
  distMin: 20, // px of pointer travel between spawns (average 24, randomised per spawn = organic spacing)
  distMax: 28,
  maxActive: 43,
  spinMin: 170, // deg/s (average 210)
  spinMax: 250,
  jitter: 8, // px random offset around the pointer
  palette: 'footer' as 'footer' | 'shiva', // which colour pairs the flowers use
  box: 64, // rendered box; sizes are applied with transform scale so nothing re-lays-out
};

// Denser preset for the Playtime "flower trail" section: flowers every ~14px of travel, a bigger pool, a
// slightly longer life, and a wider bloom when the pointer rests (see `idle`).
const FLOWER_DENSE = { ...FLOWER, distMin: 11, distMax: 17, maxActive: 110, lifeMin: 1.1, lifeMax: 1.5, jitter: 12, palette: 'shiva' as 'footer' | 'shiva' };
const IDLE_FLOWER = { everyMs: 160, spread: 42 }; // resting pointer: a flower every 160ms, scattered within 42px

const C = { orange: '#DA9C68', terracotta: '#CB7951', burgundy: '#5A2822', rust: '#B5604F', blue: '#7F98C5', peach: '#DDBAA0', gold: '#E1AF77' };
// [petal, centre] pairs, chosen for contrast.
const flowerPairs: [string, string][] = [
  [C.orange, C.burgundy], [C.terracotta, C.peach], [C.burgundy, C.gold], [C.rust, C.peach],
  [C.blue, C.gold], [C.peach, C.rust], [C.gold, C.burgundy], [C.blue, C.burgundy], [C.terracotta, C.gold],
];

// Colours sampled from public/assets/Shiva.svg: deep and mid blues, blue-greys, golds, oranges, corals, creams.
const S = { deep: '#1B4A70', navy: '#20496A', blue: '#2C597B', steel: '#396486', slate: '#59788D', mist: '#69899F', haze: '#87A2B1', sky: '#95ACBA',
  gold: '#D8AA47', sun: '#E0B861', amber: '#D7A138', peach: '#E48E6D', orange: '#DF8B55', coral: '#E37A6E', red: '#E16660', rose: '#E57566', cream: '#F2DFA4', ivory: '#F6F3E0' };
const shivaPairs: [string, string][] = [
  [S.deep, S.cream], [S.steel, S.ivory], [S.slate, S.ivory], [S.haze, S.deep], [S.gold, S.navy], [S.sun, S.deep],
  [S.peach, S.navy], [S.orange, S.ivory], [S.coral, S.ivory], [S.red, S.cream], [S.blue, S.coral], [S.mist, S.gold],
  [S.rose, S.navy], [S.sky, S.red], [S.amber, S.deep],
];

// 3 near-identical 8-petal silhouettes (rounded petals, small round centre) for subtle variety.
const silhouettes = [
  { n: 8, core: 9, petal: <circle cx="0" cy="-26" r="15" /> },
  { n: 8, core: 9, petal: <ellipse cx="0" cy="-27" rx="13" ry="17" /> },
  { n: 8, core: 10, petal: <circle cx="0" cy="-29" r="13" /> },
];
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const Flower: React.FC<{ shape: number }> = ({ shape }) => {
  const { n, core, petal } = silhouettes[shape];
  return (
    <svg viewBox="-50 -50 100 100" width="100%" height="100%" aria-hidden="true" focusable="false">
      <g className="ft-flower-petals">
        {Array.from({ length: n }, (_, k) => (
          <g key={k} transform={`rotate(${(360 / n) * k})`}>{petal}</g>
        ))}
      </g>
      <circle className="ft-flower-core" r={core} />
    </svg>
  );
};

type ImageTrailProps = {
  /** 'image' (default) is the original full-screen photo trail; 'flower' is the footer overlay. */
  variant?: 'image' | 'flower';
  /** Flower variant only: more flowers per pointer movement (Playtime section). */
  dense?: boolean;
  /** Flower variant only: keep producing flowers while the pointer rests, like the image trail does. */
  idle?: boolean;
};

export const ImageTrail: React.FC<ImageTrailProps> = ({ variant = 'image', dense = false, idle = false }) => {
  const isFlower = variant === 'flower';
  const cfg = dense ? FLOWER_DENSE : FLOWER;
  const flowerPool = React.useMemo(() => Array.from({ length: cfg.maxActive }, (_, i) => i % silhouettes.length), [cfg]);
  const containerRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<(HTMLElement | null)[]>([]);

  // State refs for animation logic to avoid re-renders
  const lastDropPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const lastDropTime = useRef(0);
  const hasEntered = useRef(false);
  const currentIndex = useRef(0);
  const zIndexCounter = useRef(10);
  const threshold = isFlower ? cfg.distMax : 45; // lower threshold for smoother, denser trail
  const nextDist = useRef<number>(cfg.distMin);
  const active = useRef<boolean[]>([]);
  const lastPair = useRef<number[]>([]);

  const dropFlower = (x: number, y: number, resting = false) => {
    const n = flowerPool.length;
    let slot = -1;
    for (let k = 0; k < n; k++) {
      const i = (currentIndex.current + k) % n;
      if (!active.current[i]) { slot = i; break; }
    }
    lastDropPos.current = { x, y };
    lastDropTime.current = Date.now();
    nextDist.current = rand(cfg.distMin, cfg.distMax);
    if (slot < 0) return; // pool exhausted: skip rather than recycle a visible flower
    const el = imageRefs.current[slot];
    if (!el) return;
    currentIndex.current = (slot + 1) % n;
    active.current[slot] = true;

    // Colour pair: random, never one of the last two used.
    const pairs = cfg.palette === 'shiva' ? shivaPairs : flowerPairs;
    let pi = 0;
    do { pi = Math.floor(Math.random() * pairs.length); } while (lastPair.current.includes(pi));
    lastPair.current = [pi, ...lastPair.current].slice(0, 2);
    el.style.setProperty('--ft-petal', pairs[pi][0]);
    el.style.setProperty('--ft-core', pairs[pi][1]);

    const life = rand(cfg.lifeMin, cfg.lifeMax);
    const k = rand(cfg.sizeMin, cfg.sizeMax) / cfg.box;
    const spread = resting ? IDLE_FLOWER.spread : cfg.jitter;
    const dir = Math.random() < 0.5 ? -1 : 1;
    const popIn = 0.2;

    gsap.killTweensOf(el);
    gsap.set(el, {
      x: x + rand(-spread, spread) - cfg.box / 2,
      y: y + rand(-spread, spread) - cfg.box / 2,
      rotation: rand(0, 360),
      scale: 0.2 * k,
      opacity: 0,
      zIndex: zIndexCounter.current++,
    });
    // One timeline per flower: constant-speed spin for its whole life (no jumps). Newest flowers are
    // biggest: after a quick pop-in (0.2 -> 1.08 -> 1) each one keeps shrinking with age until it vanishes.
    gsap.timeline({ onComplete: () => { active.current[slot] = false; } })
      .to(el, { rotation: `+=${dir * rand(cfg.spinMin, cfg.spinMax) * life}`, duration: life, ease: 'none' }, 0)
      .to(el, { opacity: 1, duration: 0.1, ease: 'none' }, 0)
      .to(el, { scale: 1.08 * k, duration: popIn, ease: 'power2.out' }, 0)
      .to(el, { scale: 0, duration: life - popIn, ease: 'power1.in' }, popIn)
      .to(el, { opacity: 0, duration: life * 0.3, ease: 'power1.in' }, life * 0.7);
  };

  const dropImage = (x: number, y: number) => {
    const img = imageRefs.current[currentIndex.current];
    if (img) {
      gsap.killTweensOf(img);
      
      const rotation = (currentIndex.current % 2 === 0 ? 1 : -1) * (5 + Math.random() * 15);

      gsap.set(img, {
        x: x - img.offsetWidth / 2,
        y: y - img.offsetHeight / 2,
        scale: 0.1, // Start very small
        rotation: rotation,
        opacity: 1, // ensure it's visible without fading in
        zIndex: zIndexCounter.current++,
      });

      // Scale up gently
      gsap.to(img, {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Shrink out completely
          gsap.to(img, {
            scale: 0, 
            duration: 1.2,
            delay: 0.4,
            ease: "power2.inOut"
          });
        }
      });
    }

    currentIndex.current = (currentIndex.current + 1) % images.length;
    lastDropTime.current = Date.now();
    lastDropPos.current = { x, y };
  };

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      // Flowers are a mouse/pen effect: never react to touch scrolling.
      if (isFlower && e.pointerType === 'touch') return;
      // The trail is a motion effect: reduced-motion visitors keep the page static.
      if (motionQuery.matches) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      currentPos.current = { x, y };

      if (isFlower) {
        // Re-entry: restart the distance measure instead of spawning at a jump.
        if (!hasEntered.current) { lastDropPos.current = { x, y }; hasEntered.current = true; return; }
        if (Math.hypot(x - lastDropPos.current.x, y - lastDropPos.current.y) > nextDist.current) dropFlower(x, y);
        return;
      }

      const dx = x - lastDropPos.current.x;
      const dy = y - lastDropPos.current.y;
      hasEntered.current = true;
      const distance = Math.hypot(dx, dy);

      if (distance > threshold) {
        dropImage(x, y);
      }
    };

    const handlePointerLeave = () => {
      hasEntered.current = false;
    };

    const container = containerRef.current;
    // The flower layer ignores pointer events itself, so it listens on the footer that contains it.
    const target: HTMLElement | null = isFlower ? container?.parentElement ?? null : container;
    if (target) {
      target.addEventListener('pointermove', handlePointerMove);
      target.addEventListener('pointerleave', handlePointerLeave);
      target.addEventListener('pointercancel', handlePointerLeave);
    }
    
    // Idle dropping runs only while the trail is on screen and motion is not reduced.
    let idleInterval: ReturnType<typeof setInterval> | undefined;
    const startIdle = () => {
      if ((isFlower && !idle) || idleInterval || !inView || motionQuery.matches) return;
      idleInterval = setInterval(() => {
        if (!hasEntered.current) return;
        if (isFlower) {
          if (Date.now() - lastDropTime.current >= IDLE_FLOWER.everyMs) dropFlower(currentPos.current.x, currentPos.current.y, true);
        } else if (Date.now() - lastDropTime.current >= 400) {
          dropImage(currentPos.current.x, currentPos.current.y);
        }
      }, 50);
    };
    const stopIdle = () => {
      clearInterval(idleInterval);
      idleInterval = undefined;
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) startIdle();
      else stopIdle();
    });
    if (container) observer.observe(container);
    startIdle();

    return () => {
      observer.disconnect();
      stopIdle();
      imageRefs.current.forEach(image => { if (image) gsap.killTweensOf(image); });
      active.current = [];
      if (target) {
        target.removeEventListener('pointermove', handlePointerMove);
        target.removeEventListener('pointerleave', handlePointerLeave);
        target.removeEventListener('pointercancel', handlePointerLeave);
      }
    };
  }, [isFlower, idle]);

  if (isFlower) {
    return (
      <div ref={containerRef as React.RefObject<HTMLDivElement>} className="ft-flowers" aria-hidden="true">
        {flowerPool.map((shape, i) => (
          <span
            key={i}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            className="ft-flower"
          >
            <Flower shape={shape} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative w-full h-screen bg-[#F7F7F7] overflow-hidden cursor-crosshair flex items-center justify-center"
    >
      <div className="z-20 pointer-events-none text-center">
        <h2 className="font-display text-[48px] md:text-[88px] font-bold text-[#1a1a1a] tracking-tight leading-none">
          Keep moving.
        </h2>
        <p className="trail-subtitle">Leave a trail behind.</p>
      </div>

      {images.map((src, i) => (
        <img
          key={i}
          ref={(el) => {
            imageRefs.current[i] = el;
          }}
          src={src}
          decoding="async"
          alt="trail"
          className="absolute top-0 left-0 w-32 h-40 md:w-44 md:h-56 object-cover shadow-2xl pointer-events-none opacity-0 will-change-transform"
        />
      ))}
    </section>
  );
};
