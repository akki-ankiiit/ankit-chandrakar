import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const pagesData = [
  // Leaf 0
  {
    id: 'cover',
    type: 'cover',
    src: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=800&auto=format&fit=crop",
    title: "VOGUE",
    subtitle: "Spring Collection 2025"
  },
  {
    id: 'img1',
    type: 'split',
    src: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=800&auto=format&fit=crop",
    title: "Velvet Mirage",
    text: "Luxury Editorial"
  },
  // Leaf 1
  {
    id: 'img2',
    type: 'split',
    src: "https://images.unsplash.com/photo-1592355591829-aaae33fcff1d?q=80&w=800&auto=format&fit=crop",
    title: "Neon Shadows",
    text: "Urban Fashion"
  },
  {
    id: 'img3',
    type: 'split',
    src: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=800&auto=format&fit=crop",
    title: "Silent Echo",
    text: "High Couture"
  },
  // Leaf 2
  {
    id: 'img4',
    type: 'split',
    src: "https://images.unsplash.com/photo-1523510468197-455cc987be86?q=80&w=800&auto=format&fit=crop",
    title: "Crimson Peak",
    text: "Avant Garde"
  },
  {
    id: 'img5',
    type: 'split',
    src: "https://images.unsplash.com/photo-1569154107747-fb00e3b3430d?q=80&w=800&auto=format&fit=crop",
    title: "Concrete Jungle",
    text: "Street Style"
  },
  // Leaf 3
  {
    id: 'img6',
    type: 'split',
    src: "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=800&auto=format&fit=crop",
    title: "Pure Canvas",
    text: "Minimalist"
  },
  {
    id: 'img7',
    type: 'split',
    src: "https://images.unsplash.com/photo-1596868801151-5d26796963b7?q=80&w=800&auto=format&fit=crop",
    title: "Desert Bloom",
    text: "Editorial"
  },
  // Leaf 4
  {
    id: 'img8',
    type: 'split',
    src: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop",
    title: "Lucid Dreams",
    text: "Conceptual"
  },
  {
    id: 'img9',
    type: 'split',
    src: "https://images.unsplash.com/photo-1536195892759-c8a3c8e1945e?q=80&w=800&auto=format&fit=crop",
    title: "Golden Hour",
    text: "Portrait"
  },
  // Leaf 5
  {
    id: 'new_img1',
    type: 'split',
    src: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=800&auto=format&fit=crop",
    title: "Vintage Charm",
    text: "Retro Aesthetics"
  },
  {
    id: 'new_img2',
    type: 'split',
    src: "https://images.unsplash.com/photo-1592355591829-aaae33fcff1d?q=80&w=800&auto=format&fit=crop",
    title: "Chic Minimal",
    text: "Modern Wardrobe"
  },
  // Leaf 6
  {
    id: 'new_img3',
    type: 'split',
    src: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=800&auto=format&fit=crop",
    title: "Monochrome",
    text: "Black & White"
  },
  {
    id: 'new_img4',
    type: 'split',
    src: "https://images.unsplash.com/photo-1523510468197-455cc987be86?q=80&w=800&auto=format&fit=crop",
    title: "Neon Nights",
    text: "Cyberpunk Edge"
  },
  // Leaf 7
  {
    id: 'new_img5',
    type: 'split',
    src: "https://images.unsplash.com/photo-1569154107747-fb00e3b3430d?q=80&w=800&auto=format&fit=crop",
    title: "Autumn Fall",
    text: "Seasonal Hues"
  },
  {
    id: 'new_img6',
    type: 'split',
    src: "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=800&auto=format&fit=crop",
    title: "Tailored Fit",
    text: "Bespoke Suiting"
  },
  // Leaf 8
  {
    id: 'new_img7',
    type: 'split',
    src: "https://images.unsplash.com/photo-1596868801151-5d26796963b7?q=80&w=800&auto=format&fit=crop",
    title: "Streetwear",
    text: "Urban Explorer"
  },
  {
    id: 'new_img8',
    type: 'split',
    src: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop",
    title: "Vibrant Youth",
    text: "Color Theory"
  },
  // Leaf 9
  {
    id: 'new_img9',
    type: 'split',
    src: "https://images.unsplash.com/photo-1536195892759-c8a3c8e1945e?q=80&w=800&auto=format&fit=crop",
    title: "Denim Daze",
    text: "Classic Blues"
  },
  {
    id: 'new_img10',
    type: 'split',
    src: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=800&auto=format&fit=crop",
    title: "High Contrast",
    text: "Studio Lighting"
  },
  // Leaf 10
  {
    id: 'text-end',
    type: 'text',
    title: "The End",
    content: "Thank you for exploring our editorial collection."
  },
  {
    id: 'back',
    type: 'back',
    text: "Velvet Mirage"
  }
];

// Helper to render a page based on its type
const RenderPage = ({ page, isLeft }: { page: typeof pagesData[0], isLeft: boolean }) => {
  return (
    <div className={`w-full h-full bg-white overflow-hidden relative ${isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}>
      {page.type === 'cover' && (
        <div className={`w-full h-full relative select-none bg-white overflow-hidden ${isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}>
          <img src={page.src} alt="cover" draggable={false} className="w-full h-full object-cover pointer-events-none select-none" />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-6">
            <h1 className="text-white text-5xl md:text-6xl tracking-widest font-serif mb-4">{page.title}</h1>
            <p className="text-white/80 text-[10px] tracking-[0.4em] uppercase">{page.subtitle}</p>
          </div>
        </div>
      )}

      {page.type === 'text' && (
        <div className={`w-full h-full p-12 flex flex-col justify-center items-center text-center bg-[#fafafa] pointer-events-none select-none overflow-hidden ${isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}>
          <div className="w-8 h-px bg-black/20 mb-8" />
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-[#111] leading-snug">{page.title}</h2>
          <p className="text-[#666] leading-relaxed text-sm">{page.content}</p>
          <div className="w-8 h-px bg-black/20 mt-8" />
        </div>
      )}

      {page.type === 'image' && (
        <img src={page.src} alt="page" draggable={false} className={`w-full h-full object-cover pointer-events-none select-none ${isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'}`} />
      )}

      {page.type === 'split' && (
        <div className={`w-full h-full flex flex-col select-none bg-white overflow-hidden ${isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}>
          <div className="h-[70%] w-full relative">
            <img src={page.src} alt="page" draggable={false} className="w-full h-full object-cover pointer-events-none select-none" />
          </div>
          <div className="h-[30%] w-full p-8 flex flex-col justify-center items-center text-center pointer-events-none border-t border-black/5">
            <p className="text-[#999] text-[9px] uppercase tracking-[0.4em] mb-3">{page.text}</p>
            <h3 className="text-xl font-serif text-[#111]">{page.title}</h3>
          </div>
        </div>
      )}

      {page.type === 'back' && (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-[#111] pointer-events-none select-none overflow-hidden ${isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}>
          <span className="font-script text-3xl text-[var(--color-accent-orange)] mb-4">(fin)</span>
          <h2 className="text-white/50 text-[10px] tracking-[0.5em] uppercase">{page.text}</h2>
        </div>
      )}

      {/* Crease shadow for realism */}
      <div 
        className={`absolute inset-y-0 w-16 pointer-events-none ${isLeft ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-black/10 to-transparent`}
      />
      {/* Edge highlight */}
      <div 
        className={`absolute inset-y-0 w-px pointer-events-none ${isLeft ? 'left-0 bg-black/10' : 'right-0 bg-black/10'}`}
      />
    </div>
  );
};

interface LeafProps {
  index: number;
  isFlipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  totalLeaves: number;
}

const Leaf: React.FC<LeafProps> = ({ index, isFlipped, front, back, totalLeaves }) => {
  return (
    <motion.div
      data-flipbook-leaf={index}
      className="absolute top-0 left-0 w-full h-full origin-left"
      style={{
        transformStyle: 'preserve-3d',
      }}
      initial={false}
      animate={{
        rotateY: isFlipped ? -180 : 0,
        z: isFlipped ? index * 0.1 : -index * 0.1, // Corrected: higher index = higher z = closer to camera when flipped
        zIndex: isFlipped ? index : totalLeaves - index,
      }}
      transition={{
        type: 'spring',
        stiffness: 40,
        damping: 15,
        mass: 1.2
      }}
    >
      {/* Front Face (Right Side) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden rounded-r-2xl bg-white pointer-events-none"
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      >
        {front}
      </div>

      {/* Back Face (Left Side) - rotated 180deg to face correctly when flipped */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden rounded-l-2xl bg-white pointer-events-none"
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        {back}
      </div>
    </motion.div>
  );
};

export const Flipbook: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // Reserve room for the entire open spread, including the spine and perspective.
    const resize = () => setScale(Math.min(1, Math.max(0, scene.clientWidth - 32) / 760));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  const handleBookClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If they click on the right half of the screen, flip forward.
    // If they click on the left half of the screen, flip backward.
    const isRightSide = e.clientX > window.innerWidth / 2;
    if (isRightSide) {
      if (currentPage < leaves.length) {
        setCurrentPage(prev => prev + 1);
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  const leaves = [];
  for (let i = 0; i < pagesData.length; i += 2) {
    if (pagesData[i] && pagesData[i + 1]) {
      leaves.push({
        front: <RenderPage page={pagesData[i]} isLeft={false} />,
        back: <RenderPage page={pagesData[i + 1]} isLeft={true} />
      });
    }
  }

  const handleNext = () => {
    if (currentPage < leaves.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <section className="w-full min-h-screen bg-[#e5e5e5] flex flex-col items-center justify-center py-32 relative overflow-hidden">
      
      {/* Section Title */}
      <div className="absolute top-16 w-full text-center z-0">
        <p className="text-[10px] tracking-[0.3em] text-[#888] uppercase mb-2">Editorial Series</p>
        <h2 className="text-xl tracking-widest text-[#111] font-serif uppercase">The Collection</h2>
      </div>

      {/* 3D Scene Container */}
      <div ref={sceneRef} data-flipbook-scene className="w-full max-w-[800px] relative z-10 select-none" style={{ height: 520 * scale }}>
        <div 
          className="absolute left-1/2 top-0"
          style={{ perspective: '2500px', width: 380, height: 520, marginLeft: -190, transform: `scale(${scale})`, transformOrigin: 'center top' }}
        >
          {/* Dynamic Drop Shadow */}
          <motion.div 
            className="absolute h-[520px] bg-black/10 blur-xl top-1/2 -translate-y-1/2 pointer-events-none"
            animate={{
              width: currentPage === 0 ? '380px' : '760px',
              left: currentPage === 0 ? '0px' : '-380px',
              x: currentPage > 0 ? '50%' : '0%',
            }}
            transition={{
              type: 'spring',
              stiffness: 40,
              damping: 15,
            }}
          />
          
          <motion.div
            className="absolute inset-0 w-full h-full cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            onClick={handleBookClick}
            animate={{
              rotateX: 10,
              rotateY: currentPage > 0 ? 0 : -10,
              rotateZ: 0,
              x: currentPage > 0 ? '50%' : '0%', 
            }}
            transition={{
              type: 'spring',
              stiffness: 40,
              damping: 15,
            }}
          >
            {/* Hard spine binding visual */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-[530px] bg-gradient-to-r from-[#999] via-[#ccc] to-[#999] rounded-sm shadow-xl z-[-1] pointer-events-none" />
            
            {/* Leaves */}
            {leaves.map((leaf, index) => (
              <Leaf
                key={index}
                index={index}
                totalLeaves={leaves.length}
                isFlipped={currentPage > index}
                front={leaf.front}
                back={leaf.back}
              />
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-8 md:bottom-12 w-full px-8 md:px-24 grid grid-cols-2 md:grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 items-center z-20 pointer-events-none">
        <button 
          onClick={handlePrev} 
          disabled={currentPage === 0}
          className="pointer-events-auto justify-self-start min-h-11 px-6 py-3 bg-[#111] text-white text-[10px] tracking-widest uppercase rounded-full hover:scale-105 transition-transform disabled:opacity-0 disabled:pointer-events-none"
        >
          Previous
        </button>
        <p data-flipbook-help className="order-3 col-span-2 md:order-none md:col-span-1 text-center text-[10px] tracking-[0.2em] text-[#111] uppercase opacity-70">Click edges or buttons to flip</p>
        <button 
          onClick={handleNext}
          disabled={currentPage === leaves.length}
          className="pointer-events-auto justify-self-end min-h-11 px-6 py-3 bg-[#111] text-white text-[10px] tracking-widest uppercase rounded-full hover:scale-105 transition-transform disabled:opacity-0 disabled:pointer-events-none"
        >
          Next
        </button>
      </div>

    </section>
  );
};
