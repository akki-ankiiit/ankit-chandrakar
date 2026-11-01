import React, { useRef, useMemo, useState } from "react";
import { useAnimationFrame, motion, useMotionValue, useSpring } from "framer-motion";

export interface TunnelItem {
  id: string;
  url?: string;
  width?: string;
  height?: string;
  isText?: boolean;
  text?: React.ReactNode;
}

interface TunnelGalleryProps {
  items: TunnelItem[];
}

interface TunnelGalleryItemProps {
  item: TunnelItem;
  outerRef: React.Ref<HTMLDivElement>;
}

const TunnelGalleryItem: React.FC<TunnelGalleryItemProps> = ({ item, outerRef }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring configuration for buttery smooth magnetic return
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Max movement is 30px in any direction
    x.set(((e.clientX - centerX) / rect.width) * 60);
    y.set(((e.clientY - centerY) / rect.height) * 60);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={outerRef}
      className="absolute flex items-center justify-center pointer-events-auto cursor-pointer"
      style={{ 
        width: item.width || "300px",
        height: item.height || "400px",
        transformStyle: "preserve-3d",
        willChange: "transform, opacity"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ x: smoothX, y: smoothY }}
        animate={{ 
          scale: isHovered ? 1.05 : 1,
          boxShadow: isHovered 
            ? "0 0 60px rgba(255,255,255,0.25), 0 20px 40px rgba(0,0,0,0.8)" 
            : "0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.02)"
        }}
        transition={{ duration: 0.3 }}
      >
        {item.isText ? (
          item.text
        ) : (
          <img loading="lazy" decoding="async"
            src={item.url} 
            alt=""
            className="w-full h-full object-cover rounded-xl border border-white/5"
          />
        )}
      </motion.div>
    </div>
  );
};

export const TunnelGallery3D: React.FC<TunnelGalleryProps> = ({ items }) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Layout calculations
  const itemCount = items.length;
  const zStart = -6000;
  const zEnd = 1500;
  const zRange = zEnd - zStart;
  
  const layout = useMemo(() => {
    return items.map((_, i) => {
      // Distribute evenly along Z depth
      const initialZ = zStart + (i / itemCount) * zRange;
      
      // Distribute around the center (creating tunnel walls)
      // Golden angle distribution for natural scattered look
      const angle = (i * 2.39996); 
      // Keep them away from center, varying radius
      const radius = 350 + Math.random() * 600; 
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Random scale for variation
      const scale = 0.6 + Math.random() * 0.8;
      
      return { initialZ, x, y, scale };
    });
  }, [items]);

  const zPositions = useRef(layout.map(l => l.initialZ));
  const SPEED = 4; // Z units per frame

  useAnimationFrame(() => {
    itemRefs.current.forEach((ref, index) => {
      if (!ref) return;
      let newZ = zPositions.current[index] + SPEED;
      
      // Loop back to start when past camera
      if (newZ > zEnd) {
        newZ = zStart;
      }
      zPositions.current[index] = newZ;
      
      const { x, y, scale } = layout[index];
      ref.style.transform = `translate3d(${x}px, ${y}px, ${newZ}px) scale(${scale})`;
      
      // Opacity fade in/out at extremes
      let opacity = 1;
      if (newZ < -5000) opacity = (newZ - zStart) / 1000;
      if (newZ > 500) opacity = 1 - ((newZ - 500) / 1000);
      ref.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
    });
  });

  return (
    <div 
      className="relative w-full h-full overflow-hidden flex items-center justify-center bg-transparent pointer-events-none"
      style={{ perspective: "1000px" }}
    >
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ 
          transformStyle: "preserve-3d"
        }}
      >
        {items.map((item, index) => (
          <TunnelGalleryItem 
            key={item.id}
            item={item}
            outerRef={el => { itemRefs.current[index] = el; }}
          />
        ))}
      </div>
    </div>
  );
};
