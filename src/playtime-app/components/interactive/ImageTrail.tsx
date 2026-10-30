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

export const ImageTrail: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // State refs for animation logic to avoid re-renders
  const lastDropPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const lastDropTime = useRef(0);
  const hasEntered = useRef(false);
  const currentIndex = useRef(0);
  const zIndexCounter = useRef(10);
  const threshold = 45; // lower threshold for smoother, denser trail

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
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      currentPos.current = { x, y };
      hasEntered.current = true;

      const dx = x - lastDropPos.current.x;
      const dy = y - lastDropPos.current.y;
      const distance = Math.hypot(dx, dy);

      if (distance > threshold) {
        dropImage(x, y);
      }
    };

    const handlePointerLeave = () => {
      hasEntered.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
    }
    
    // Idle dropping interval
    const idleInterval = setInterval(() => {
      if (hasEntered.current && Date.now() - lastDropTime.current >= 400) {
        dropImage(currentPos.current.x, currentPos.current.y);
      }
    }, 50);
    
    return () => {
      clearInterval(idleInterval);
      if (container) {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#F7F7F7] overflow-hidden cursor-crosshair flex items-center justify-center"
    >
      <div className="z-20 pointer-events-none text-center">
        <h2 className="font-display text-[48px] md:text-[88px] font-bold text-[#1a1a1a] tracking-tight leading-none">
          Keep moving.
        </h2>
        <p className="text-[#666] mt-4 font-medium text-lg">Leave a trail behind.</p>
      </div>

      {images.map((src, i) => (
        <img
          key={i}
          ref={(el) => {
            imageRefs.current[i] = el;
          }}
          src={src}
          alt="trail"
          className="absolute top-0 left-0 w-32 h-40 md:w-44 md:h-56 object-cover shadow-2xl pointer-events-none opacity-0 will-change-transform"
        />
      ))}
    </section>
  );
};
