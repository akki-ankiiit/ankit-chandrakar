import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

export interface DockItemData {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface DockItemProps {
  item: DockItemData;
  mouseX: any;
}

const DockItem: React.FC<DockItemProps> = ({ item, mouseX }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Calculate distance from cursor to the center of this icon
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Base width is 56px, gap is ~10-16px. Total width per item ~66-72px.
  // We use 66px steps to calculate the influence range smoothly.
  const sizeSync = useTransform(
    distance,
    [-170, -132, -66, 0, 66, 132, 170],
    [56, 67.2, 84, 112, 84, 67.2, 56]
  );

  // Apply a very smooth and gentle spring
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 150, damping: 14 });

  // Offset Y so the icon scales upwards while structurally staying centered
  const y = useTransform(size, (s) => -(s - 56) / 2);

  // Handle click bounce
  const handleClick = () => {
    setIsClicked(true);
    if (item.onClick) item.onClick();
    setTimeout(() => setIsClicked(false), 1800);
  };

  return (
    <div className="relative flex flex-col items-center justify-end">
      <motion.div
        className="relative flex flex-col items-center"
        animate={isClicked ? { y: [0, -40, 0, -40, 0, -40, 0] } : { y: 0 }}
        transition={
          isClicked 
            ? { duration: 1.8, ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn"] }
            : { type: "spring", stiffness: 300, damping: 15 }
        }
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-[68px] px-3.5 py-1.5 bg-[#222] border border-white/10 text-white text-[13px] tracking-wide font-medium rounded-lg shadow-xl whitespace-nowrap z-50"
            >
              {item.label}
              {/* Tooltip pointer edge */}
              <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#222] border-b border-r border-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Icon Container */}
        <motion.button
          ref={ref}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          style={{ width: size, height: size, y, transformOrigin: "bottom" }}
          className="relative flex items-center justify-center rounded-2xl cursor-pointer"
          aria-label={item.label}
        >
          <img
            src={item.icon}
            alt={item.label}
            className="w-full h-full object-cover rounded-2xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] pointer-events-none"
            draggable={false}
          />
        </motion.button>
      </motion.div>

      {/* Active Indicator */}
      {item.isActive && (
        <div className="absolute -bottom-2.5 w-1 h-1 bg-white/40 rounded-full" />
      )}
    </div>
  );
};

interface DockProps {
  items: DockItemData[];
}

export const Dock: React.FC<DockProps> = ({ items }) => {
  const mouseX = useMotionValue(-1000); // start completely off-screen
  const [isDockHovered, setIsDockHovered] = useState(false);

  return (
    <div
      className="flex items-end justify-center w-full pb-12"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseEnter={() => setIsDockHovered(true)}
      onMouseLeave={() => {
        mouseX.set(-1000); // smoothly animate back to 1.0x when leaving
        setIsDockHovered(false);
      }}
    >
      <motion.div
        animate={{
          gap: isDockHovered ? "4px" : "2px",
          padding: "4px 10px"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center rounded-[24px] bg-[#1a1a1a]/80 backdrop-blur-[24px] border border-white/5 h-[80px]"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
      >
        {items.map((item) => (
          <DockItem key={item.id} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </div>
  );
};
