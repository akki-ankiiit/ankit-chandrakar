
import { TunnelGallery3D, type TunnelItem } from "../interactive/TunnelGallery3D";

const TUNNEL_ITEMS: TunnelItem[] = [
  {
    id: "img-1",
    url: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=400&auto=format&fit=crop",
    width: "280px",
    height: "360px",
  },
  {
    id: "img-2",
    url: "https://images.unsplash.com/photo-1592355591829-aaae33fcff1d?q=80&w=400&auto=format&fit=crop",
    width: "320px",
    height: "240px",
  },
  {
    id: "img-3",
    url: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=400&auto=format&fit=crop",
    width: "200px",
    height: "200px",
  },
  {
    id: "img-4",
    url: "https://images.unsplash.com/photo-1523510468197-455cc987be86?q=80&w=400&auto=format&fit=crop",
    width: "250px",
    height: "350px",
  },
  {
    id: "img-5",
    url: "https://images.unsplash.com/photo-1569154107747-fb00e3b3430d?q=80&w=400&auto=format&fit=crop",
    width: "300px",
    height: "300px",
  },
  {
    id: "img-6",
    url: "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=400&auto=format&fit=crop",
    width: "350px",
    height: "250px",
  },
  {
    id: "img-7",
    url: "https://images.unsplash.com/photo-1596868801151-5d26796963b7?q=80&w=400&auto=format&fit=crop",
    width: "220px",
    height: "320px",
  },
  {
    id: "img-8",
    url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop",
    width: "280px",
    height: "280px",
  },
  {
    id: "img-9",
    url: "https://images.unsplash.com/photo-1536195892759-c8a3c8e1945e?q=80&w=400&auto=format&fit=crop",
    width: "300px",
    height: "400px",
  },
];

export const TunnelGallerySection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black font-sans border-t border-white/5">
      {/* Central Typography - "GALLERY 3D" */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tighter drop-shadow-2xl mix-blend-difference">
          My Space
        </h2>
      </div>

      <div className="relative z-0 w-full h-full">
        <TunnelGallery3D items={TUNNEL_ITEMS} />
      </div>
    </section>
  );
};
