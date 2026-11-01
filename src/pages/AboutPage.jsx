import { Link } from 'react-router-dom';
import HeroArtwork from '../components/HeroArtwork.jsx';
import { Pill, SocialLinks } from '../components/ui.jsx';
import { artworks, education, experience, imagery, profile } from '../data/portfolio.js';

const galleryGroups = [
  { number: '02', title: 'Colour & quiet', description: 'Selected artwork — a study in soft greens, a portrait in warm orange.', ids: ['goose', 'reena'] },
  { number: '03', title: 'Character studies', description: 'Selected artwork — Zoey and Mira from K-Pop Demon Hunters.', ids: ['kdh-zoey', 'kdh-mira'] },
];

export default function AboutPage() {
  return (
    <div className="about-page page-enter">
      <section className="hero hero-compact about-page-hero" aria-labelledby="about-page-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">A little about me</p>
            <h1 id="about-page-title">A little structure.<br />A little personality.</h1>
            <p className="hero-introduction">{profile.bio}</p>
            <div className="hero-socials">
              <Pill href={profile.resume}>View résumé</Pill>
              <SocialLinks />
            </div>
          </div>
          <div className="hero-art"><HeroArtwork /></div>
        </div>
      </section>

      <figure className="about-page-team-photo container">
        <img src="/assets/TeamNyusta.png" alt="The Nyusta team gathered beside an outdoor pool" width="1920" height="1080" loading="lazy" decoding="async" />
      </figure>

      <div className="about-page-photo-pair container">
        <figure>
          <img src="/assets/packaging/K-Series/me-and-sunil.webp" alt="Ankit Chandrakar with Sunil Agrawal" width="900" height="1200" loading="lazy" decoding="async" />
          <figcaption>Me &amp; Sunil Agrawal</figcaption>
        </figure>
        <figure>
          <img src="/assets/packaging/K-Series/signed-brochure.webp" alt="K-Series brochure signed by Sunil Agrawal" width="1400" height="1050" loading="lazy" decoding="async" />
          <figcaption>Signed by Sunil Agrawal</figcaption>
        </figure>
      </div>

      <section className="about-page-background container" aria-labelledby="about-experience-title">
        <div className="about-page-section-heading">
          <div>
            <p className="eyebrow">The path so far</p>
            <h2 id="about-experience-title">Experience</h2>
          </div>
          <a className="text-link" href={profile.resume}>Full résumé <span aria-hidden="true">↗</span></a>
        </div>
        <ul className="about-page-experience">
          {experience.map((job) => (
            <li className="about-page-experience-row" key={job.company}>
              <p className="about-page-period">{job.period}</p>
              <h3>{job.company}</h3>
              <p className="about-page-role">{job.role}</p>
            </li>
          ))}
        </ul>
        <div className="about-page-education" aria-labelledby="about-education-title">
          <h2 id="about-education-title">Education</h2>
          <div>
            <p className="about-page-period">{education.period}</p>
            <h3>{education.school}</h3>
            <p className="about-page-role">{education.degree}</p>
          </div>
        </div>
      </section>

      <section className="about-page-gallery" aria-labelledby="about-gallery-title">
        <div className="container">
          <div className="about-page-section-heading">
            <div>
              <p className="eyebrow">A visual collection</p>
              <h2 id="about-gallery-title">A little more personality.</h2>
            </div>
            <p className="about-page-gallery-note">An illustrated introduction,<br />then a few selected artworks.</p>
          </div>

          <section className="about-page-gallery-group about-page-me" aria-labelledby="about-gallery-me">
            <div className="about-page-group-heading">
              <h3 id="about-gallery-me"><span>01 /</span> Me, illustrated</h3>
              <p>A familiar face from this portfolio.</p>
            </div>
            <figure className="about-page-portrait">
              <div className="about-page-portrait-mat">
                <img src={imagery.portrait} alt="Illustrated designer wearing headphones and sketching at a desk" width="712" height="533" loading="lazy" decoding="async" />
              </div>
              <figcaption><span>{profile.fullName}</span><span>Illustrated portrait</span></figcaption>
            </figure>
          </section>

          {galleryGroups.map((group) => (
            <section className="about-page-gallery-group" key={group.number} aria-labelledby={`about-gallery-${group.number}`}>
              <div className="about-page-group-heading">
                <h3 id={`about-gallery-${group.number}`}><span>{group.number} /</span> {group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className="about-page-image-grid">
                {group.ids.map((id) => {
                  const artwork = artworks.find((item) => item.id === id);
                  return (
                    <figure key={artwork.id}>
                      <img src={artwork.image} alt={`${artwork.title} — artwork`} width={artwork.width} height={artwork.height} loading="lazy" decoding="async" />
                      <figcaption><span>{artwork.title}</span><span>Artwork · {artwork.year}</span></figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="about-page-gallery-end">
            <p>More from the visual collection.</p>
            <Link className="text-link" to="/playtime">Explore Playtime <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
