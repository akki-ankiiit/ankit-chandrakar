import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface MemoryItem {
  id: string;
  url: string;
  caption: string;
  top: string;
  left: string;
  width: string;
}

interface MemoryGalleryProps {
  items: MemoryItem[];
}

interface MemoryGalleryItemProps {
  item: MemoryItem;
  idx: number;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  smoothMouseX: any;
  smoothMouseY: any;
}

const MemoryGalleryItem: React.FC<MemoryGalleryItemProps> = ({ item, idx, hoveredId, setHoveredId, smoothMouseX, smoothMouseY }) => {
  const isHovered = hoveredId === item.id;
  const isOtherHovered = hoveredId !== null && hoveredId !== item.id;

  const depth = (idx % 3) + 1.5;
  const moveX = useTransform(smoothMouseX, [-1, 1], [-15 * depth, 15 * depth]);
  const moveY = useTransform(smoothMouseY, [-1, 1], [-15 * depth, 15 * depth]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={typeof IntersectionObserver === 'undefined' ? undefined : { opacity: 1, scale: 1 }}
      animate={typeof IntersectionObserver === 'undefined' ? { opacity: 1, scale: 1 } : undefined}
      viewport={{ once: true }}
      transition={{ 
        duration: 1.2, 
        delay: idx * 0.1, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="absolute flex flex-col group cursor-crosshair z-20"
      style={{
        top: item.top,
        left: item.left,
        width: item.width,
        x: moveX,
        y: moveY,
        filter: isOtherHovered ? "brightness(0.5) blur(2px)" : "brightness(1) blur(0px)",
        opacity: isOtherHovered ? 0.7 : 1,
        transition: "filter 0.5s ease, opacity 0.5s ease",
        transformStyle: "preserve-3d"
      }}
      onMouseEnter={() => setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="w-full text-center mb-3">
        <span className="text-[#e8e6e3] text-[10px] font-mono tracking-normal uppercase drop-shadow-md whitespace-nowrap">
          {item.caption}
        </span>
      </div>
      <motion.div
        className="relative w-full rounded-none overflow-hidden border border-white/20"
        style={{
          boxShadow: isHovered 
            ? "0 30px 60px rgba(0,0,0,0.6), 0 0 60px rgba(255,0,0,0.6)" 
            : "0 10px 30px rgba(0,0,0,0.4), 0 0 40px rgba(255,0,0,0.2)",
          transition: "box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
        }}
        animate={{
          scale: isHovered ? 1.08 : 1,
          rotateZ: isHovered ? (idx % 2 === 0 ? 1 : -1) : 0,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img loading="lazy" decoding="async"
          src={item.url}
          alt={item.caption}
          className="w-full h-auto object-cover transition-transform duration-1000 ease-out"
          style={{
            transform: isHovered ? "scale(1.1)" : "scale(1.02)",
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
        />
      </motion.div>
    </motion.div>
  );
};

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ items }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global mouse values for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery parallax
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="relative w-full h-full font-sans">
      {items.map((item, idx) => (
        <MemoryGalleryItem 
          key={item.id} 
          item={item} 
          idx={idx} 
          hoveredId={hoveredId} 
          setHoveredId={setHoveredId} 
          smoothMouseX={smoothMouseX} 
          smoothMouseY={smoothMouseY} 
        />
      ))}
    </div>
  );
};
