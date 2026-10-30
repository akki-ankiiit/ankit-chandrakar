import { useRef } from "react";
import { motion, useMotionValue, useSpring, useAnimationFrame } from "framer-motion";

interface GlobeGalleryProps {
  images: string[];
  radius?: number;
}

export const GlobeGallery: React.FC<GlobeGalleryProps> = ({ images, radius = 350 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for the rotation
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Smooth springs to make drag and release buttery
  const springX = useSpring(rotateX, { damping: 30, stiffness: 100, mass: 1 });
  const springY = useSpring(rotateY, { damping: 30, stiffness: 100, mass: 1 });

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const autoRotateSpeed = useRef(0.2); // Degrees per frame

  // Use Fibonacci sphere to distribute images evenly, including the poles, without overlapping
  const numItems = images.length;
  const items = images.map((url, i) => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / numItems);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

    const rotY = (theta * 180) / Math.PI;
    const rotX = ((phi - Math.PI / 2) * 180) / Math.PI;

    return { url, rotX, rotY };
  });

  // Auto-rotation loop
  useAnimationFrame(() => {
    if (!isDragging.current) {
      rotateY.set(rotateY.get() + autoRotateSpeed.current);
    }
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    // Adjust sensitivity by multiplying delta
    rotateY.set(rotateY.get() + deltaX * 0.5);
    rotateX.set(rotateX.get() - deltaY * 0.5); // Invert Y for natural drag

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: 0,
          height: 0,
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-md overflow-hidden"
            style={{
              width: "60px",
              height: "40px",
              // Translate by -50% to center it on the origin before pushing it out
              transform: `translate(-50%, -50%) rotateY(${item.rotY}deg) rotateX(${item.rotX}deg) translateZ(${radius}px)`,
              transformStyle: "preserve-3d",
              boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
            }}
          >
            <img 
              src={item.url} 
              alt={`Gallery ${i}`} 
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
