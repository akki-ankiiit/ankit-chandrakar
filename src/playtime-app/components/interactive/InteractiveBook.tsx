import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Shapes, Globe, Image as ImageIcon, Layout, Target, ArrowRight, ArrowLeft, Code, Cpu, Smartphone, Rocket, Shield, Users, Zap, Briefcase, Coffee, Star } from 'lucide-react';

interface LeafProps {
  index: number;
  isFlipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  onClick: () => void;
  totalLeaves: number;
}

const Leaf: React.FC<LeafProps> = ({ index, isFlipped, front, back, onClick, totalLeaves }) => {
  return (
    <motion.div
      onClick={onClick}
      className="absolute top-0 left-0 w-full h-full cursor-pointer origin-left"
      style={{
        transformStyle: 'preserve-3d',
      }}
      initial={false}
      animate={{
        rotateY: isFlipped ? -180 : 0,
        z: isFlipped ? (totalLeaves - index) * 0.1 : -index * 0.1, // Small z-offset to prevent z-fighting
        zIndex: isFlipped ? index : totalLeaves - index,
      }}
      transition={{
        type: 'spring',
        stiffness: 40,
        damping: 15,
        mass: 1.2
      }}
    >
      {/* Front of leaf */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden backface-hidden rounded-r-xl border border-black/10 shadow-sm"
        style={{ backfaceVisibility: 'hidden' }}
      >
        {front}
      </div>

      {/* Back of leaf */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden backface-hidden rounded-l-xl border border-black/10 shadow-sm"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        {back}
      </div>
    </motion.div>
  );
};

export const InteractiveBook: React.FC = () => {
  const [currentLeaf, setCurrentLeaf] = useState(0);

  const handleLeafClick = (index: number) => {
    if (index === currentLeaf) {
      // Flip forward
      setCurrentLeaf(prev => prev + 1);
    } else if (index === currentLeaf - 1) {
      // Flip backward
      setCurrentLeaf(prev => prev - 1);
    }
  };

  const leaves = [
    // LEAF 0: Cover
    {
      front: (
        <div className="w-full h-full bg-[#1A1A1A] text-white p-8 flex flex-col justify-between">
          <div className="flex justify-end">
            <span className="text-[var(--color-accent-orange)] font-script text-3xl">(port-me)</span>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-5xl font-bold leading-[1.1]">Product<br/>Design</h2>
            <p className="text-[#999] text-sm">with AI & Privacy based in Raipur, IND</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#ccc] group">
            Open Book <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-[#f4f4f4] text-[#1a1a1a] p-8 flex flex-col justify-center">
          <h3 className="font-display text-3xl font-semibold mb-6">The Promise</h3>
          <p className="text-lg text-[#666] leading-relaxed">
            We help fast moving digital startups launch sharper brands and websites — with clarity, speed, and no drama.
          </p>
        </div>
      )
    },
    // LEAF 1: Core Services
    {
      front: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Brand & Identity</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Branding</h4>
                <p className="text-sm text-[#666]">Crafting unique identities that resonate.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Shapes className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Logo</h4>
                <p className="text-sm text-[#666]">Memorable marks for modern companies.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Digital Presence</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Website</h4>
                <p className="text-sm text-[#666]">High-converting landing pages and sites.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Interface</h4>
                <p className="text-sm text-[#666]">Intuitive product UX/UI design.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // LEAF 2: New Services 1
    {
      front: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Development</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Front-end</h4>
                <p className="text-sm text-[#666]">React, Next.js, and modern web apps.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Mobile</h4>
                <p className="text-sm text-[#666]">Cross-platform responsive design.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Growth & SEO</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Performance</h4>
                <p className="text-sm text-[#666]">Lightning fast loading speeds.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">SEO Strategy</h4>
                <p className="text-sm text-[#666]">Ranking higher in search engines.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // LEAF 3: New Services 2
    {
      front: (
        <div className="w-full h-full bg-[#1A1A1A] text-white p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8 text-[var(--color-accent-orange)]">AI & Innovation</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-[var(--color-accent-orange)]" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">AI Integration</h4>
                <p className="text-sm text-gray-400">Smart features for modern products.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[var(--color-accent-orange)]" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Privacy First</h4>
                <p className="text-sm text-gray-400">Secure by design architecture.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-[#f4f4f4] text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Our Process</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Discovery</h4>
                <p className="text-sm text-[#666]">Understanding your unique goals.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Execution</h4>
                <p className="text-sm text-[#666]">Rapid prototyping and delivery.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // LEAF 4: Testimonials / Metrics
    {
      front: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Why Us?</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Dedicated Team</h4>
                <p className="text-sm text-[#666]">No freelancers, just our core team.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Proven Track Record</h4>
                <p className="text-sm text-[#666]">50+ successful launches worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-[#1A1A1A] text-white p-8 flex flex-col justify-center items-center text-center">
          <Star className="w-12 h-12 text-[var(--color-accent-orange)] mb-6" />
          <h3 className="font-display text-2xl font-semibold mb-4">"The best design partner we've ever had."</h3>
          <p className="text-sm text-gray-400">- Satisfied Founder</p>
        </div>
      )
    },
    // LEAF 5: New Page 1
    {
      front: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Case Studies</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Startup X</h4>
                <p className="text-sm text-[#666]">Increased conversion by 150%.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Fintech Y</h4>
                <p className="text-sm text-[#666]">Rebranded to target Gen-Z users.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">More Case Studies</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">SaaS Z</h4>
                <p className="text-sm text-[#666]">Decreased churn by redesigning UX.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // LEAF 6: New Page 2
    {
      front: (
        <div className="w-full h-full bg-[#1A1A1A] text-white p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8 text-[var(--color-accent-orange)]">Our Vision</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <p className="text-gray-300 leading-relaxed">
              We believe in building digital experiences that feel human. We avoid templates, cut the fluff, and focus on pure, unadulterated value for your end-users.
            </p>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">FAQ</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <h4 className="font-semibold text-md mb-1">How long does it take?</h4>
              <p className="text-xs text-[#666]">Most projects take 2-4 weeks.</p>
            </div>
            <div>
              <h4 className="font-semibold text-md mb-1">Do you code?</h4>
              <p className="text-xs text-[#666]">Yes, we provide full React/Next.js builds.</p>
            </div>
          </div>
        </div>
      )
    },
    // LEAF 7: New Page 3
    {
      front: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Contact Us</h3>
          <div className="flex-1 flex flex-col justify-center gap-6 text-center">
            <p className="text-lg font-medium">Ready to start?</p>
            <p className="text-[#666] text-sm">Drop us a line and let's discuss your product goals.</p>
            <a href="mailto:akkiankit999@gmail.com" className="font-semibold text-[var(--color-accent-orange)] underline underline-offset-4 mt-4">
              akkiankit999@gmail.com
            </a>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-[#f4f4f4] text-[#1a1a1a] p-8 flex flex-col justify-center items-center text-center">
          <h3 className="font-display text-2xl font-semibold mb-4">Almost at the end...</h3>
          <p className="text-sm text-gray-500">Flip one more time to see our plans.</p>
        </div>
      )
    },
    // LEAF 8: Strategy & Back Cover
    {
      front: (
        <div className="w-full h-full bg-white text-[#1a1a1a] p-8 flex flex-col">
          <h3 className="font-display text-2xl font-semibold mb-8">Creative & Strategy</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Illustration</h4>
                <p className="text-sm text-[#666]">Custom artwork to elevate your brand.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Strategy</h4>
                <p className="text-sm text-[#666]">Positioning your product for success.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      back: (
        <div className="w-full h-full bg-[var(--color-accent-orange)] text-white p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <span className="w-3 h-3 rounded-full bg-white inline-block animate-pulse"></span>
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Available for New Projects</h2>
          <p className="text-white/80 mb-8">Let's build something great together.</p>
          <a href="#pricing" className="bg-white text-[var(--color-accent-orange)] px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2">
            View Plans
          </a>
          <div className="mt-12 flex items-center gap-2 text-sm text-white/70 cursor-pointer group" onClick={() => setCurrentLeaf(0)}>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Close Book
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="w-full min-h-screen bg-[var(--color-bg-primary)] py-24 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent-orange)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-16 text-center z-10">
        <span className="font-script text-3xl md:text-4xl text-[var(--color-accent-orange)] select-none mb-4 block">
          (explore)
        </span>
        <h2 className="font-display text-[32px] sm:text-[40px] leading-[1.2] font-semibold text-[#1a1a1a]">
          The Interactive Playbook
        </h2>
        <p className="text-[#666] mt-4">Click the pages to flip through our offerings.</p>
      </div>

      <div className="w-full max-w-[800px] flex justify-center z-10">
        {/* The Scene - requires perspective */}
        <div 
          className="relative"
          style={{ 
            perspective: '2000px',
            width: 'min(400px, 45vw)',
            height: 'min(550px, 65vh)',
          }}
        >
          {/* The Book Wrapper - rotated to show 3D volume */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateX: 10,
              rotateY: currentLeaf > 0 ? 0 : -10,
              rotateZ: 0,
              x: currentLeaf > 0 ? '50%' : '0%', // shift to right when opened so it stays centered
            }}
            transition={{
              type: 'spring',
              stiffness: 40,
              damping: 15,
            }}
          >
            {/* The Leaves */}
            {leaves.map((leaf, index) => (
              <Leaf
                key={index}
                index={index}
                totalLeaves={leaves.length}
                isFlipped={currentLeaf > index}
                front={leaf.front}
                back={leaf.back}
                onClick={() => handleLeafClick(index)}
              />
            ))}

            {/* Back cover pseudo-element to give the book a thick right side when closed */}
            <div 
              className="absolute inset-0 w-full h-full bg-[#111] rounded-r-xl shadow-2xl pointer-events-none"
              style={{
                transform: `translateZ(${-leaves.length * 0.1 - 2}px)`,
                borderRadius: '0 12px 12px 0'
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
