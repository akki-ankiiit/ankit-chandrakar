import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PenTool, Globe, Layout, Compass } from 'lucide-react';

export const Values = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  // Fade from gray to black
  const color1 = useTransform(scrollYProgress, [0, 0.3], ["#5C5C5C", "#000000"]);
  const color2 = useTransform(scrollYProgress, [0.3, 0.6], ["#5C5C5C", "#000000"]);
  const color3 = useTransform(scrollYProgress, [0.6, 1], ["#5C5C5C", "#000000"]);



  return (
    <section ref={containerRef} id="services" className="w-full bg-bg-primary min-h-screen py-24 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* (hello) */}
      <span className="font-script text-4xl md:text-5xl text-[var(--color-accent-orange)] select-none mb-6">
        (hello)
      </span>

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="font-display text-[32px] sm:text-[40px] md:text-[48px] leading-[1.2] md:leading-[56px] tracking-tight font-semibold text-black flex flex-wrap justify-center gap-[0.25em]">
          <motion.span style={{ color: color1 }}>We help fast moving digital startups</motion.span>
          <motion.span style={{ color: color2 }}>launch sharper brands and websites —</motion.span>
          <motion.span style={{ color: color3 }}>with clarity, speed, and no drama.</motion.span>
        </h2>
      </div>

      {/* Chips Grid */}
      <div className="flex flex-col gap-3 mt-12 items-center justify-center w-full max-w-3xl px-4">
        {/* Row 1 */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="premium-chip">
            {/* 4-point star */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
              <path d="M12 0c.5 6 5.5 11 11.5 11.5-.5.5-5.5 5.5-11.5 11.5-.5-.5-5.5-5.5-11.5-11.5C6 11.5 11 6.5 12 0z" />
            </svg>
            <span>Branding</span>
          </div>

          <div className="premium-chip">
            <Globe className="w-4 h-4 shrink-0" />
            <span>Logo</span>
          </div>

          <div className="premium-chip">
            <Globe className="w-4 h-4 shrink-0" />
            <span>Website</span>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="premium-chip">
            <PenTool className="w-4 h-4 shrink-0" />
            <span>Illustration</span>
          </div>

          <div className="premium-chip">
            <Layout className="w-4 h-4 shrink-0" />
            <span>Interface</span>
          </div>

          <div className="premium-chip">
            <Compass className="w-4 h-4 shrink-0" />
            <span>Strategy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
