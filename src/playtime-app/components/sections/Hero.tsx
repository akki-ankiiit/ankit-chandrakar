
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextAnimate } from "@/components/ui/text-animate";

export const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-12 overflow-hidden px-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center z-10">

        {/* Avatars & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="flex -space-x-3">
            <img src="https://images.unsplash.com/photo-1784039798906-e00bd48d9f73?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Avatar 1" className="w-8 h-8 rounded-full border-2 border-[var(--color-bg-primary)] object-cover grayscale" />
            <img src="https://images.unsplash.com/photo-1783711394928-f93f63a6bf8e?q=80&w=1730&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Avatar 2" className="w-8 h-8 rounded-full border-2 border-[var(--color-bg-primary)] object-cover grayscale" />
            <img src="https://images.unsplash.com/photo-1783638204039-110e6856aee7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Avatar 3" className="w-8 h-8 rounded-full border-2 border-[var(--color-bg-primary)] object-cover grayscale" />
          </div>
          <span className="text-[#666666] text-[15px] font-medium tracking-wide">Trusted by founders.</span>
        </motion.div>

        {/* Huge Heading */}
        <h1
          className="font-display font-bold text-[48px] md:text-[64px] lg:text-[88px] leading-[1.1] tracking-tight max-w-[1100px] text-[#1A1A1A] flex flex-wrap justify-center items-center gap-x-4 gap-y-2"
        >
          <TextAnimate as="span" animation="blurInUp" by="character" once>Product</TextAnimate>

          <motion.img
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200&auto=format&fit=crop"
            alt="Mobile UI"
            className="inline-block w-[56px] h-[80px] md:w-[68px] md:h-[100px] rounded-full object-cover align-middle"
          />

          <TextAnimate as="span" animation="blurInUp" by="character" once className="text-[#FF4D00]">Design</TextAnimate>

          <div className="w-full basis-full h-0"></div>

          <TextAnimate as="span" animation="blurInUp" by="character" once className="text-[#666666] font-medium text-[40px] md:text-[56px] lg:text-[72px]">with</TextAnimate>

          <motion.img
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=200&auto=format&fit=crop"
            alt="Designer working"
            className="inline-block w-[56px] h-[56px] md:w-[80px] md:h-[80px] rounded-full object-cover align-middle"
          />

          <TextAnimate as="span" animation="blurInUp" by="character" once>AI & Privacy</TextAnimate>

          <div className="w-full basis-full h-0"></div>

          <TextAnimate as="span" animation="blurInUp" by="character" once className="text-[#666666] font-medium text-[40px] md:text-[56px] lg:text-[72px]">based in</TextAnimate>
          <TextAnimate as="span" animation="blurInUp" by="character" once>Raipur,</TextAnimate>

          <motion.img
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            src="https://images.unsplash.com/photo-1783638204039-110e6856aee7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Big Ben"
            className="inline-block w-[56px] h-[56px] md:w-[80px] md:h-[80px] round-corner:100px object-cover align-middle"
          />

          <TextAnimate as="span" animation="blurInUp" by="character" once>IND</TextAnimate>
        </h1>

        {/* Subtitle Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 text-[#666666] max-w-[650px] mx-auto text-base md:text-[18px] font-medium leading-[1.6]"
        >
          We make it easy for startups to launch,grow, and scale with clean ,
          <br className="hidden md:block" />
          conversion focused designs —no delays, no drama.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12"
        >
          <a href="#works" className="inline-flex items-center justify-center gap-2 bg-[#4D4D4D] text-white px-8 py-4 rounded-full text-[15px] font-medium hover:bg-[#333333] transition-colors group shadow-sm">
            View Plans
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
