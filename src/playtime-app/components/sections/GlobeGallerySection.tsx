
import { GlobeGallery } from "../interactive/GlobeGallery";

const GLOBE_IMAGES = [
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

// Use 72 images total to double the density
// 9 * 8 = 72 images
const ALL_GLOBE_IMAGES = [
  ...GLOBE_IMAGES, ...GLOBE_IMAGES, ...GLOBE_IMAGES, ...GLOBE_IMAGES,
  ...GLOBE_IMAGES, ...GLOBE_IMAGES, ...GLOBE_IMAGES, ...GLOBE_IMAGES
];

export const GlobeGallerySection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans border-t border-black/5 bg-white">
      <div className="absolute inset-0 z-0">
        <GlobeGallery images={ALL_GLOBE_IMAGES} radius={220} />
      </div>
    </section>
  );
};
