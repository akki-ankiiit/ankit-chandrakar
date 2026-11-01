
import type { MemoryItem } from "../interactive/MemoryGallery";
import { MemoryGallery } from "../interactive/MemoryGallery";

const SCATTERED_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    url: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=400&auto=format&fit=crop",
    caption: "[ Running ]",
    top: "18%",
    left: "15%",
    width: "9%",
  },
  {
    id: "mem-2",
    url: "https://images.unsplash.com/photo-1592355591829-aaae33fcff1d?q=80&w=400&auto=format&fit=crop",
    caption: "[ summer party ]",
    top: "6%",
    left: "34%",
    width: "9%",
  },
  {
    id: "mem-3",
    url: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=400&auto=format&fit=crop",
    caption: "[ city lights ]",
    top: "6%",
    left: "58%",
    width: "9%",
  },
  {
    id: "mem-4",
    url: "https://images.unsplash.com/photo-1523510468197-455cc987be86?q=80&w=400&auto=format&fit=crop",
    caption: "[ Workout session ]",
    top: "18%",
    left: "77%",
    width: "9%",
  },
  {
    id: "mem-5",
    url: "https://images.unsplash.com/photo-1569154107747-fb00e3b3430d?q=80&w=400&auto=format&fit=crop",
    caption: "[ City walk ]",
    top: "39%",
    left: "3%",
    width: "9%",
  },
  {
    id: "mem-6",
    url: "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=400&auto=format&fit=crop",
    caption: "[ sunset run ]",
    top: "39%",
    left: "84%",
    width: "9%",
  },
  {
    id: "mem-7",
    url: "https://images.unsplash.com/photo-1596868801151-5d26796963b7?q=80&w=400&auto=format&fit=crop",
    caption: "[ morning ritual ]",
    top: "60%",
    left: "15%",
    width: "9%",
  },
  {
    id: "mem-8",
    url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop",
    caption: "[ gym session ]",
    top: "60%",
    left: "34%",
    width: "9%",
  },
  {
    id: "mem-9",
    url: "https://images.unsplash.com/photo-1536195892759-c8a3c8e1945e?q=80&w=400&auto=format&fit=crop",
    caption: "[ new playlist ]",
    top: "60%",
    left: "58%",
    width: "9%",
  },
  {
    id: "mem-10",
    url: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=400&auto=format&fit=crop",
    caption: "[ creative mode ]",
    top: "60%",
    left: "77%",
    width: "9%",
  },
];

export const MemoryGallerySection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans border-t border-white/5">
      {/* Deep Red Background exactly like screenshot */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#800000_0%,#400000_60%,#1a0000_100%)]"></div>

      {/* Central Typography */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col text-[#e8e6e3] select-none">
          <div className="flex items-start justify-between w-full relative">
            <h2
              className="text-4xl md:text-5xl lg:text-5xl tracking-tight leading-[0.85] italic font-light pr-1"
              style={{ fontFamily: "'PP Editorial New', 'Editorial New', serif" }}
            >
              welcome
            </h2>
            <span className="absolute top-0 right-0 text-4xl md:text-5xl font-light leading-none">+</span>
          </div>
          <h2
            className="text-6xl md:text-5xl lg:text-5xl tracking-tight leading-[0.85] mt-1 md:mt-1 italic"
            style={{ fontFamily: "'PP Editorial New', 'Editorial New', serif" }}
          >
            to this canvas
          </h2>
          <div className="w-full flex justify-end mt-4 md:mt-3 pr-3">
            <span
              className="text-xs md:text-lg italic tracking-[0.1em] text-[#e8e6e3]"
              style={{ fontFamily: "'PP Editorial New', 'Editorial New', serif" }}
            >
              since 2002
            </span>
          </div>
        </div>
      </div>

      {/* Floating words scattered around */}
      <div className="absolute inset-0 z-10 pointer-events-none font-sans text-xs text-[#e8e6e3]/60 tracking-widest">
        <span className="absolute top-[20%] left-[6%]">some</span>
        <span className="absolute top-[50%] left-[20%]">of</span>
        <span className="absolute top-[25%] left-[88%]">moments</span>
        <span className="absolute top-[71%] left-[82%]">life</span>
        <span className="absolute top-[85%] left-[50%] -translate-x-1/2">my</span>
      </div>

      <div className="relative z-20 w-full h-full">
        <MemoryGallery items={SCATTERED_MEMORIES} />
      </div>
    </section>
  );
};
