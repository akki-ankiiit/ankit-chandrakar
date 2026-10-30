
import { ArrowRight, Check } from 'lucide-react';

export const Pricing = () => {
  return (
    <section id="services" className="w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
      <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wide mb-12">
        (Pricing Plan)
      </p>

      <div className="w-full flex flex-col gap-6">
        
        {/* Standard Plan */}
        <div className="w-full bg-[#F8F8F8] rounded-[32px] p-10 md:p-14 flex flex-col md:flex-row gap-12 shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
          {/* Left */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="font-display text-3xl font-bold mb-4">Standard Plan</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-sm">
                Ideal for lean teams or startups needing clean, fast design delivery for websites or branding assets.
              </p>
            </div>
            <div className="mt-12 flex justify-between items-center text-sm font-medium border-t border-gray-200 pt-6">
              <span className="text-[var(--color-text-secondary)]">Delivery Time</span>
              <span>4-6weeks</span>
            </div>
          </div>
          
          {/* Right */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-end gap-2 mb-8">
              <h3 className="font-display text-5xl font-bold">500$</h3>
              <span className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">/month</span>
            </div>
            
            <div className="w-full border-t border-gray-200 mb-6"></div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm font-medium">
                <Check className="w-4 h-4 text-gray-500" /> You provide the wireframe
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <Check className="w-4 h-4 text-gray-500" /> Visual design using Figma & Framer
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <Check className="w-4 h-4 text-gray-500" /> Focused on website or branding only
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <Check className="w-4 h-4 text-gray-500" /> Weekday turnaround (Mon-Fri)
              </li>
            </ul>
            
            <button className="w-full bg-[#4D4D4D] text-white rounded-full py-4 flex items-center justify-center gap-2 font-medium hover:bg-black transition-colors group">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="w-full bg-black rounded-[32px] p-10 md:p-14 flex flex-col md:flex-row gap-12 text-white relative overflow-hidden hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
          {/* Orange glow background at bottom */}
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-[#FF4D00] rounded-full blur-[100px] opacity-40"></div>
          
          {/* Left */}
          <div className="flex-1 flex flex-col justify-between z-10">
            <div>
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="font-display text-3xl font-bold mb-4">Premium Plan</h3>
              <p className="text-[var(--color-text-light-muted)] text-sm leading-relaxed max-w-sm">
                A complete design experience — tailored strategy, polished visuals, and flexible collaboration throughout the process.
              </p>
            </div>
            <div className="mt-12 flex justify-between items-center text-sm font-medium border-t border-white/20 pt-6">
              <span className="text-[var(--color-text-light-muted)]">Delivery Time</span>
              <span>4-6weeks</span>
            </div>
          </div>
          
          {/* Right */}
          <div className="flex-1 flex flex-col z-10">
            <div className="mb-8">
              <p className="font-display text-3xl font-bold mb-1">Starting at</p>
              <h3 className="font-display text-5xl font-bold text-[var(--color-accent-orange)]">$1000</h3>
            </div>
            
            <div className="w-full border-t border-white/20 mb-6"></div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex gap-3 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-white" /></div> 
                Help shaping your wireframe or brief
              </li>
              <li className="flex gap-3 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-white" /></div> 
                Custom design for website, brand, or logo
              </li>
              <li className="flex gap-3 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-white" /></div> 
                High-fidelity mockups using Figma & Framer
              </li>
              <li className="flex gap-3 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-white" /></div> 
                Dedicated weekday focus & deeper involvement
              </li>
            </ul>
            
            <button className="w-full bg-white/10 backdrop-blur-md text-white rounded-full py-4 flex items-center justify-center gap-2 font-medium hover:bg-white hover:text-black transition-colors group">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
