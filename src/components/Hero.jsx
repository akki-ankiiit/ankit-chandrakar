import { profile } from '../data/portfolio.js';
import { Pill, SocialLinks } from './ui.jsx';
import HeroArtwork from './HeroArtwork.jsx';
import '../styles/hiring-home.css';

export default function Hero({ isHub = false, onNavigate }) {
  return (
    <section className={`hero hero-compact ${isHub ? 'hero-hub hero-design-desk' : 'hiring-hero'}`} aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          {!isHub && <p className="hero-name">{profile.fullName}</p>}
          <h1 id="hero-title">{isHub ? 'A curious mind. A considered practice.' : profile.headline}</h1>
          <p className="hero-introduction">{isHub ? 'A little more about how I think, the tools I use, and the places I share my work.' : profile.introduction}</p>
          {!isHub && <p className="hero-availability">{profile.availability}</p>}
          <div className="hero-socials">
            <Pill href="/#work" onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
              event.preventDefault();
              onNavigate('work');
            }}>{isHub ? 'See my work' : 'View selected work'}</Pill>
            {isHub ? <SocialLinks /> : <Pill className="hero-resume" href={profile.resume} download>Download résumé</Pill>}
          </div>
          {!isHub && <a className="text-link hero-email" href={`mailto:${profile.email}`}>{profile.email}</a>}
          {isHub ? (
            <a className="text-link" href="#work" onClick={(event) => { event.preventDefault(); onNavigate('work'); }}>Explore my projects ↗</a>
          ) : (
            <>
              {profile.stats.length > 0 && (
                <div className="hero-stats" aria-label="Selected project scope">
                  {profile.stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
                </div>
              )}
            </>
          )}
        </div>
        <div className="hero-art"><HeroArtwork videoSrc={isHub ? '/assets/design-desk-paper.mp4' : undefined} poster={isHub ? '/assets/design-desk-paper-poster.webp' : undefined} ariaLabel={isHub ? 'Animated illustration of a young designer holding design and software logo blocks' : undefined} /></div>
      </div>
    </section>
  );
}
