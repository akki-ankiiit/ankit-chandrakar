import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const projects = [
  {
    id: "01",
    title: "Archin",
    description: "We've helped businesses across industries achieve their goals. Here are some of our selected works.",
    year: "2025",
    role: "Lead Designer",
    services: ["Website Design", "Product Design", "Branding", "Development"],
    bgGradient: "bg-gradient-to-b from-[#1C1C1C] to-[#101010]",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "02",
    title: "VNTNR",
    description: "We've partnered with businesses across various industries to help them achieve their goals.",
    year: "2018",
    role: "Logo Designer",
    services: ["Designing", "Branding", "Redesigning", "Development"],
    bgGradient: "bg-gradient-to-b from-[#3E2519] to-[#1F120C]",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "03",
    title: "The New Standard",
    description: "We've collaborated with companies from diverse sectors to turn their visions into reality. Here's a look at some of our featured work.",
    year: "2023",
    role: "Website Designer",
    services: ["Branding", "Revamp", "Development", "Designing"],
    bgGradient: "bg-gradient-to-b from-[#352D26] to-[#1C1713]",
    image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1200"
  }
];

const ProjectCard = ({ project, index, progress, total }: any) => {
  const isLast = index === total - 1;
  
  // Range is calculated so the card starts animating a bit after it sticks.
  const start = index * (1 / total);
  
  const targetScale = 1 - ((total - index) * 0.05);
  
  const scale = useTransform(progress, [start, 1], [1, targetScale]);
  const opacity = useTransform(progress, [start, 1], [1, 0.3]);
  const rotateX = useTransform(progress, [start, 1], [0, 8]); // bend angle

  return (
    <motion.div 
      style={{
        scale: isLast ? 1 : scale,
        opacity: isLast ? 1 : opacity,
        rotateX: isLast ? 0 : rotateX,
        transformOrigin: "top center",
        transformPerspective: 1000,
        top: '2.5rem' // stick at the exact same position
      }}
      className={`w-full max-w-[1400px] h-[800px] rounded-[48px] ${project.bgGradient} p-12 md:p-16 flex flex-col md:flex-row justify-between relative overflow-hidden text-white sticky shadow-2xl`}
    >
      {/* Left Column */}
      <div className="flex flex-col justify-between h-full w-full md:w-1/4 z-10">
        <p className="text-[var(--color-text-light-muted)] text-sm leading-relaxed max-w-[200px]">
          {project.description}
        </p>
        <div>
          <p className="text-[var(--color-text-light-muted)] text-sm mb-4">{project.id} / 03</p>
          <h2 className="font-display text-5xl md:text-7xl font-bold">{project.title}</h2>
        </div>
      </div>

      {/* Center Column (Image) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm md:max-w-md h-[500px] rounded-3xl overflow-hidden shadow-2xl z-20 group">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>

      {/* Right Column */}
      <div className="flex flex-col justify-between h-full w-full md:w-1/4 items-start md:items-end text-left md:text-right z-10">
        <div className="text-left w-full max-w-[200px] mx-auto md:ml-auto md:mr-0">
          <p className="text-[var(--color-text-light-muted)] text-xs mb-1">Year</p>
          <p className="font-semibold text-xl">{project.year}</p>
        </div>
        
        <div className="text-left w-full max-w-[200px] mx-auto md:ml-auto md:mr-0 mt-8 md:mt-0">
          <p className="text-[var(--color-text-light-muted)] text-xs mb-1">Role</p>
          <p className="text-sm font-medium">{project.role}</p>
          
          <p className="text-[var(--color-text-light-muted)] text-xs mb-1 mt-6">Services</p>
          <ul className="text-sm font-medium space-y-1">
            {project.services.map((service: string) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export const Works = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} id="works" className="w-full flex flex-col items-center gap-12 px-4 md:px-8 pb-32">
      {projects.map((project, index) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          index={index} 
          progress={smoothProgress} 
          total={projects.length} 
        />
      ))}
      
      <div className="mt-32 w-full border-t border-gray-300"></div>
    </section>
  );
};
