

export const Footer = () => {
  return (
    <footer id="contact" className="w-full bg-black text-white relative overflow-hidden pt-32 pb-6 mt-20 rounded-t-[48px]">
      {/* Orange Glow Background at the bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-[var(--color-accent-orange)] rounded-t-full blur-[120px] opacity-40"></div>

      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col">
        {/* Contact Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold max-w-sm leading-[1.1]">
              Let's make something happen together
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="border-b border-white/20 pb-2">
              <input type="email" placeholder="Enter the Email" className="w-full bg-transparent outline-none placeholder:text-gray-500 font-medium text-sm" />
            </div>
            <div>
              <p className="text-gray-500 font-medium text-sm mb-2">Project Description</p>
              <textarea placeholder="Type Here..." className="w-full h-24 bg-transparent outline-none placeholder:text-gray-500 font-medium text-sm resize-none border-b border-white/20 pb-2"></textarea>
            </div>
            <button className="w-full bg-white text-black font-medium py-4 rounded-full hover:bg-gray-200 transition-colors">
              Send Now!
            </button>
          </div>
        </div>

        {/* Marquee Section */}
        <div className="w-full overflow-hidden mb-24 border-y border-white/10 py-8">
          <div className="flex w-[200%] animate-marquee-left items-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="font-display font-bold text-4xl md:text-6xl whitespace-nowrap px-8">
                  akkiankit999@gmail.com
                </span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-6">Navigation</p>
            <ul className="space-y-4">
              <li><a href="#about" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">About</a></li>
              <li><a href="#works" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Works</a></li>
              <li><a href="#services" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Services</a></li>
              <li><a href="#blog" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-6">Social</p>
            <ul className="space-y-4">
              <li><a href="#" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Twitter(X)</a></li>
              <li><a href="#" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">LinkedIn</a></li>
              <li><a href="#" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Dribble</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-6">Legals</p>
            <ul className="space-y-4">
              <li><a href="#" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-xl font-medium hover:text-[var(--color-accent-orange)] transition-colors">Term of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex justify-between items-center text-xs text-white/60 mb-20">
          <p>© 2025 Ankit. All rights reserved.</p>
          <p>London → {new Date().toLocaleTimeString('en-US', { hour12: false })}</p>
        </div>
      </div>

      {/* Massive Ankit Text */}
      <div className="w-full flex justify-center mt-auto px-4 translate-y-12 mix-blend-overlay">
        <h1 className="font-display font-bold text-[25vw] leading-[0.75] text-white tracking-tighter text-center">
          Ankit
        </h1>
      </div>
    </footer>
  );
};
