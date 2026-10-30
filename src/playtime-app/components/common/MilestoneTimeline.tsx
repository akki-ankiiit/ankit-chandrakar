import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const milestones = [
  {
    id: 1,
    title: "The Genesis",
    date: "Jan 2019",
    description: "Founded with a vision to bridge the gap between design and technology, creating seamless user experiences.",
    iconUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png",
  },
  {
    id: 2,
    title: "First Major Client",
    date: "Aug 2020",
    description: "Partnered with a Fortune 500 company to redesign their core product suite, reaching millions of users.",
    iconUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Handshake/3D/handshake_3d.png",
  },
  {
    id: 3,
    title: "Global Expansion",
    date: "Mar 2022",
    description: "Opened our second office in London, expanding our diverse team of world-class designers and engineers.",
    iconUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20showing%20Europe-Africa/3D/globe_showing_europe-africa_3d.png",
  },
  {
    id: 4,
    title: "Industry Recognition",
    date: "Nov 2023",
    description: "Awarded 'Design Agency of the Year' by Awwwards for our innovative approach to spatial computing interfaces.",
    iconUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png",
  },
  {
    id: 5,
    title: "The Next Frontier",
    date: "Present",
    description: "Pioneering the future of web experiences with AI-driven generative interfaces and 3D web technologies.",
    iconUrl: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png",
  },
];

const MilestoneItem = ({ data }: { data: typeof milestones[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "center 60%"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <div ref={ref} className="relative flex items-start gap-8 md:gap-12 group">
      {/* Timeline Node */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          style={{ scale, opacity }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-[var(--color-accent-orange)] transition-colors duration-500 overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <img 
            src={data.iconUrl} 
            alt={data.title} 
            className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500"
          />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="flex-1 pt-2 md:pt-4 pb-12"
      >
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[var(--color-accent-orange)] text-xs font-bold tracking-widest uppercase">
          {data.date}
        </div>
        <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          {data.title}
        </h3>
        <p className="text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed max-w-2xl">
          {data.description}
        </p>
      </motion.div>
    </div>
  );
};

export const MilestoneTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 80%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="relative w-full py-32 bg-[var(--color-bg-primary)] overflow-hidden" ref={containerRef}>
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[var(--color-accent-orange)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-24 md:text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Our Journey
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto">
            A timeline of our most significant milestones, showcasing our evolution and continuous pursuit of excellence.
          </p>
        </div>

        <div className="relative">
          {/* Main Timeline Line (Background) */}
          <div className="absolute left-[31px] md:left-[39px] top-8 bottom-0 w-[2px] bg-white/5" />
          
          {/* Animated Timeline Line (Foreground) */}
          <motion.div 
            className="absolute left-[31px] md:left-[39px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-[var(--color-accent-orange)] to-purple-500 origin-top rounded-full shadow-[0_0_15px_rgba(255,100,0,0.5)]"
            style={{ scaleY: smoothProgress }}
          />

          {/* Milestones List */}
          <div className="flex flex-col">
            {milestones.map((milestone, index) => (
              <MilestoneItem key={milestone.id} data={milestone} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
