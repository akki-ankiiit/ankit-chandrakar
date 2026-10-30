
import { ArrowLeft } from 'lucide-react'; // Original seems to have a left arrow or similar, wait, no, it's a left caret in a circle.

export const Metrics = () => {
  return (
    <section id="about" className="w-full max-w-7xl mx-auto px-6 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 h-[400px]">
        {/* Left Stats Card */}
        <div className="bg-[var(--color-card-grey)] rounded-[32px] p-10 flex flex-col justify-between text-white">
          <div>
            <h3 className="font-display text-5xl font-bold">1+</h3>
            <p className="text-sm font-medium mt-1">Finalized Projects</p>
          </div>
          <div>
            <h3 className="font-display text-5xl font-bold">18%</h3>
            <p className="text-sm font-medium mt-1">Client satisfaction rate</p>
          </div>
          <div>
            <h3 className="font-display text-5xl font-bold">1M</h3>
            <p className="text-sm font-medium mt-1">Gross Revenue</p>
          </div>
        </div>

        {/* Right Testimonial Card */}
        <div className="relative bg-black rounded-[32px] overflow-hidden group">
          {/* Placeholder for actual image */}
          <div className="absolute inset-0 bg-neutral-900 w-full h-full">
            {/* Adding a subtle gradient to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000" 
              alt="Workspace" 
              className="w-full h-full object-cover opacity-80 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-10 z-20 text-white flex flex-col justify-end">
            <h3 className="font-display text-3xl md:text-4xl font-semibold leading-[1.2] max-w-xl">
              "franklin turned our ideas into a sharp, clean brand. fast, easy, and right on point."
            </h3>
            
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="font-semibold">Tom Moore</p>
                <p className="text-sm text-gray-300">Founder NovaTech</p>
              </div>
              <button className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-32 text-center text-xs text-[var(--color-text-secondary)] font-medium tracking-wide uppercase">
        (Works)
      </div>
    </section>
  );
};
