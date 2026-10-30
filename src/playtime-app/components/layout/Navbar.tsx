

export const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12">
      {/* Logo */}
      <a href="#top" className="text-[var(--color-accent-orange)] font-display font-bold text-3xl tracking-tight relative z-10">
        Ankit.
      </a>

      {/* Center Links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-8 text-[var(--color-text-secondary)] text-sm font-medium relative z-10">
        <a href="#works" className="hover:text-black transition-colors">Works</a>
        <a href="#services" className="hover:text-black transition-colors">Services</a>
        <a href="#about" className="hover:text-black transition-colors">About</a>
        <a href="#resume" className="hover:text-black transition-colors">Resume</a>
      </div>

      {/* Contact Button */}
      <a href="#contact" className="bg-[#4D4D4D] text-white text-sm px-6 py-2.5 rounded-full hover:bg-black transition-colors relative z-10">
        Contact
      </a>
    </nav>
  );
};
