import { profile } from '../data/portfolio.js';
import { Pill, SocialLinks } from './ui.jsx';
import HeroArtwork from './HeroArtwork.jsx';

export default function Hero({ isHub = false, onNavigate }) {
  return (
    <section className={`hero hero-compact ${isHub ? 'hero-hub hero-design-desk' : ''}`} aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">{isHub ? 'A curious mind. A considered practice.' : profile.headline}</h1>
          <p className="hero-introduction">{isHub ? 'A little more about how I think, the tools I use, and the places I share my work.' : profile.introduction}</p>
          <div className="hero-socials">
            <Pill href={`mailto:${profile.email}`}>Let’s talk product</Pill>
            <SocialLinks />
          </div>
          {isHub ? (
            <a className="text-link" href="#work" onClick={(event) => { event.preventDefault(); onNavigate('work'); }}>Explore my projects ↗</a>
          ) : (
            <>
              <div className="hero-stats" aria-label="Selected project scope">
                {profile.stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
              </div>
            </>
          )}
        </div>
        <div className="hero-art"><HeroArtwork videoSrc={isHub ? '/assets/design-desk-paper.mp4' : undefined} ariaLabel={isHub ? 'Animated illustration of a young designer holding design and software logo blocks' : undefined} /></div>
      </div>
    </section>
  );
}
