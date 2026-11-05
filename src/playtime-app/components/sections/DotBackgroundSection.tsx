
import { DotBackground } from "../interactive/DotBackground";

export const DotBackgroundSection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans border-t border-white/5 bg-[#002BFF]">
      {/* Interactive Canvas Background */}
      <DotBackground />
    </section>
  );
};
