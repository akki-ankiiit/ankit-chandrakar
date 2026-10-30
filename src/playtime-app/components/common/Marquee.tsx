

export const Marquee = () => {
  return (
    <section className="w-full py-20 overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="flex w-[200%] animate-marquee-left items-center">
        {/* Repeat enough times to fill screen and loop smoothly */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center">
            <span className="font-display font-bold text-6xl md:text-[120px] text-[var(--color-accent-orange)] whitespace-nowrap px-8">
              Brand Design
            </span>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-accent-orange)" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
        ))}
      </div>
      
      <div className="mt-32 text-center text-xs text-[var(--color-text-secondary)] font-medium tracking-wide uppercase">
        (Intro)
      </div>
    </section>
  );
};
