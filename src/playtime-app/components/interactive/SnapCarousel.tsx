import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, animate, useTransform, MotionValue, useAnimation, AnimatePresence } from 'framer-motion';

const baseItems = [
  {
    src: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=400&auto=format&fit=crop",
    subtitle: "Luxury Editorial",
    title: "Velvet Mirage",
    year: "2025"
  },
  {
    src: "https://images.unsplash.com/photo-1592355591829-aaae33fcff1d?q=80&w=400&auto=format&fit=crop",
    subtitle: "Urban Fashion",
    title: "Neon Shadows",
    year: "2024"
  },
  {
    src: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=400&auto=format&fit=crop",
    subtitle: "High Couture",
    title: "Silent Echo",
    year: "2025"
  },
  {
    src: "https://images.unsplash.com/photo-1523510468197-455cc987be86?q=80&w=400&auto=format&fit=crop",
    subtitle: "Avant Garde",
    title: "Crimson Peak",
    year: "2023"
  },
  {
    src: "https://images.unsplash.com/photo-1569154107747-fb00e3b3430d?q=80&w=400&auto=format&fit=crop",
    subtitle: "Street Style",
    title: "Concrete Jungle",
    year: "2024"
  },
  {
    src: "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=400&auto=format&fit=crop",
    subtitle: "Minimalist",
    title: "Pure Canvas",
    year: "2025"
  },
  {
    src: "https://images.unsplash.com/photo-1596868801151-5d26796963b7?q=80&w=400&auto=format&fit=crop",
    subtitle: "Editorial",
    title: "Desert Bloom",
    year: "2024"
  },
  {
    src: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop",
    subtitle: "Conceptual",
    title: "Lucid Dreams",
    year: "2025"
  },
  {
    src: "https://images.unsplash.com/photo-1536195892759-c8a3c8e1945e?q=80&w=400&auto=format&fit=crop",
    subtitle: "Portrait",
    title: "Golden Hour",
    year: "2023"
  },
];

const items = [...baseItems, ...baseItems, ...baseItems, ...baseItems];

let audioCtx: AudioContext | null = null;

const playTik = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Typewriter mechanical click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Square wave gives a harsher, more mechanical "clack" sound
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.02);

    // Second layer: metallic ping
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2000, audioCtx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.02);

    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);

    osc2.start();
    osc2.stop(audioCtx.currentTime + 0.02);

  } catch (e) {
    console.error(e);
  }
};

const ITEM_WIDTH = 200; // Virtual distance between items in scroll space

interface CarouselItemProps {
  item: typeof items[0];
  index: number;
  scrollX: MotionValue<number>;
  onClick: (index: number) => void;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ item, index, scrollX, onClick }) => {
  const itemOffset = index * -ITEM_WIDTH;
  const totalWidth = items.length * ITEM_WIDTH;

  const getWrappedDiff = (val: number) => {
    const diff = val - itemOffset;
    let wrappedDiff = ((diff % totalWidth) + totalWidth) % totalWidth;
    if (wrappedDiff > totalWidth / 2) {
      wrappedDiff -= totalWidth;
    }
    return wrappedDiff;
  };

  const x = useTransform(scrollX, (val) => {
    const wrappedDiff = getWrappedDiff(val);
    const dist = Math.abs(wrappedDiff / ITEM_WIDTH);
    const sign = Math.sign(wrappedDiff);
    if (dist <= 1) {
      return sign * (dist * 220); // Center to first side item
    } else {
      return sign * (220 + (dist - 1) * 45); // Tightly packed side items
    }
  });

  const scale = useTransform(scrollX, (val) => {
    const wrappedDiff = getWrappedDiff(val);
    const dist = Math.abs(wrappedDiff / ITEM_WIDTH);
    if (dist <= 1) {
      return 1 - (dist * 0.7); // Scale 1.0 down to 0.3
    } else {
      return Math.max(0.1, 0.3 - ((dist - 1) * 0.03));
    }
  });

  const opacity = useTransform(scrollX, (val) => {
    const wrappedDiff = getWrappedDiff(val);
    const dist = Math.abs(wrappedDiff / ITEM_WIDTH);
    if (dist <= 1) {
      return 1;
    } else {
      return Math.max(0, 1 - ((dist - 1) * 0.15));
    }
  });

  const zIndex = useTransform(scrollX, (val) => {
    const wrappedDiff = getWrappedDiff(val);
    const dist = Math.abs(wrappedDiff / ITEM_WIDTH);
    return 100 - Math.round(dist);
  });

  return (
    <motion.div
      className="absolute flex items-center justify-center cursor-pointer select-none"
      style={{
        width: '320px',
        height: '440px',
        x,
        scale,
        opacity,
        zIndex,
        WebkitTapHighlightColor: 'transparent'
      }}
      onClick={() => onClick(index)}
    >
      <img
        src={item.src}
        alt={item.title}
        draggable={false}
        className="w-full h-full object-cover pointer-events-none select-none"
      />
    </motion.div>
  );
};

export const SnapCarousel: React.FC = () => {
  const scrollX = useMotionValue(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const controls = useAnimation();
  const totalWidth = items.length * ITEM_WIDTH;

  useEffect(() => {
    return scrollX.onChange((val) => {
      let normalizedScroll = ((-val % totalWidth) + totalWidth) % totalWidth;
      const closestIndex = Math.round(normalizedScroll / ITEM_WIDTH) % items.length;
      
      if (closestIndex !== activeIndexRef.current) {
        activeIndexRef.current = closestIndex;
        setActiveIndex(closestIndex);
        playTik(); // play sound when crossing snap boundaries

        // Very minor subtle inward pulse
        controls.start({
          scale: [1, 0.98, 1],
          transition: { duration: 0.2, ease: "easeOut" }
        });
      }
    });
  }, [scrollX, controls, totalWidth]);

  const handlePan = (_e: any, info: any) => {
    scrollX.set(scrollX.get() + info.delta.x * 0.6);
  };

  const handlePanEnd = (_e: any, info: any) => {
    const current = scrollX.get();
    const velocity = info.velocity.x;
    const projected = current + velocity * 0.2;
    let snapped = Math.round(projected / ITEM_WIDTH) * ITEM_WIDTH;

    animate(scrollX, snapped, {
      type: "spring",
      stiffness: 150,
      damping: 18,
      mass: 1
    });
  };

  const snapToIndex = (index: number) => {
    const currentScroll = scrollX.get();
    const itemOffset = index * -ITEM_WIDTH;
    const diff = currentScroll - itemOffset;
    
    let wrappedDiff = ((diff % totalWidth) + totalWidth) % totalWidth;
    if (wrappedDiff > totalWidth / 2) {
      wrappedDiff -= totalWidth;
    }
    
    const targetScroll = currentScroll - wrappedDiff;

    animate(scrollX, targetScroll, {
      type: "spring",
      stiffness: 150,
      damping: 18,
      mass: 1
    });
  };

  const activeItem = items[activeIndex];

  return (
    <section 
      className="w-full min-h-[90vh] bg-[#f4f4f4] overflow-hidden flex flex-col items-center justify-center relative cursor-grab active:cursor-grabbing py-24"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Static Center Typography & Frame */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[460px] pointer-events-none z-20 flex flex-col justify-between">
        
        {/* Top Text */}
        <div className="absolute -top-24 left-0 right-0 text-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.title + activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <p className="carousel-caption-meta">{activeItem.subtitle}</p>
              <p className="carousel-caption-title">{activeItem.title}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Frame Brackets Container */}
        <motion.div animate={controls} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#1a1a1a]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#1a1a1a]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#1a1a1a]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#1a1a1a]"></div>
        </motion.div>

        {/* Bottom Text */}
        <div className="absolute -bottom-24 left-0 right-0 text-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.title + activeIndex + 'bottom'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              <p className="carousel-caption-meta">{activeItem.year}</p>
              <p className="carousel-caption-title">{activeItem.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 2D Container */}
      <div className="relative flex items-center justify-center w-full z-10 h-[500px]">
        <motion.div
          className="absolute inset-0 flex items-center justify-center w-full h-full"
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          {items.map((item, i) => (
            <CarouselItem
              key={i}
              item={item}
              index={i}
              scrollX={scrollX}
              onClick={snapToIndex}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
