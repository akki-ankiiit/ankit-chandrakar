import { Link } from 'react-router-dom';
import '../styles/about.css';
import HeroArtwork from '../components/HeroArtwork.jsx';
import { Pill, SocialLinks } from '../components/ui.jsx';
import { imagery, profile } from '../data/portfolio.js';

const galleryGroups = [
  {
    number: '02', kind: 'paintings', title: 'Digital paintings',
    description: 'Familiar characters, a different palette. A little nostalgia, reimagined in colour.',
    artworks: [
      { file: 'nobita-shizuka', title: 'Nobita & Shizuka', medium: 'Digital painting', width: 1200, height: 1697, alt: 'Digital illustration of Nobita and Shizuka in traditional Indian clothing against a textured ochre background' },
      { file: 'chutki-bheem', title: 'Chutki & Bheem', medium: 'Digital painting', width: 1200, height: 1697, alt: 'Digital illustration of Chutki and Bheem in red traditional clothing against a bright blue and green background' },
    ],
  },
  {
    number: '03', kind: 'sketchbook', title: 'From my sketchbook',
    description: 'Loose lines, colour experiments, and characters taking shape. A few pages from my tablet.',
    artworks: [
      { file: 'deadpool-line-study', title: 'Deadpool / Lines', medium: 'Tablet sketch', width: 1200, height: 2053, alt: 'Tablet screen showing a black line drawing of Deadpool looking over his shoulder' },
      { file: 'deadpool-colour-study', title: 'Deadpool / Colour', medium: 'Colour study', width: 1200, height: 2133, alt: 'Tablet screen showing a red and black drawing of Deadpool looking over his shoulder on a red canvas' },
      { file: 'deadpool-crossed-arms', title: 'Deadpool / Character study', medium: 'Tablet sketch', width: 1200, height: 1969, alt: 'Tablet screen showing a line drawing of Deadpool with crossed arms and two sword handles behind his shoulders' },
      { file: 'akki-character', title: 'Akki', medium: 'Digital drawing', width: 1200, height: 2133, alt: 'Tablet screen showing a cartoon boy in an orange cap, blue vest, and red shoes holding green banknotes, signed Akki' },
      { file: 'po-panda', title: 'Po / Kung Fu Panda', medium: 'Digital drawing', width: 1200, height: 2053, alt: 'Tablet screen showing a black and white drawing of Po from Kung Fu Panda balancing on one leg with his paws raised' },
    ],
  },
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
        <img src="/assets/optimized/TeamNyusta.webp" alt="The Nyusta team gathered beside an outdoor pool" width="1920" height="1080" loading="lazy" decoding="async" />
        <figcaption>Me &amp; Team Nyusta</figcaption>
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

      <section className="about-page-gallery" aria-labelledby="about-gallery-title">
        <div className="container">
          <div className="about-page-studio-intro">
            <div className="about-page-studio-copy">
              <p className="eyebrow">A visual collection</p>
              <h2 id="about-gallery-title">Drawn for the<br />joy of it.</h2>
              <p className="about-page-gallery-note">Away from the design files, I’m usually drawing. Here’s a little of that world — familiar faces, favourite characters, and ideas just for the joy of it.</p>
              <p className="about-page-studio-note">Off the clock. Still making things.</p>
            </div>
            <figure className="about-page-portrait">
              <div className="about-page-portrait-mat">
                <img src={imagery.portrait} alt="Illustrated designer wearing headphones and sketching at a desk" width="712" height="533" loading="lazy" decoding="async" />
              </div>
              <figcaption><span><span className="about-page-print-index">01 /</span> Me, illustrated</span><span>A familiar face around here.</span></figcaption>
            </figure>
          </div>

          {galleryGroups.map((group) => (
            <section className={`about-page-gallery-group about-page-${group.kind}`} key={group.number} aria-labelledby={`about-gallery-${group.number}`}>
              <div className="about-page-group-heading">
                <p className="about-page-group-index">{group.number} /</p>
                <h3 id={`about-gallery-${group.number}`}>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className="about-page-image-grid">
                {group.artworks.map((artwork, index) => (
                  <figure key={artwork.file}>
                    <div className="about-page-print"><img src={`/assets/sketches/${artwork.file}.webp`} alt={artwork.alt} width={artwork.width} height={artwork.height} loading="lazy" decoding="async" /></div>
                    <figcaption><span className="about-page-print-index">{group.number}.{String(index + 1).padStart(2, '0')}</span><span>{artwork.title}</span><span>{artwork.medium}</span></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
          <div className="about-page-gallery-end">
            <p>A little curiosity goes a long way.</p>
            <Link className="text-link" to="/playtime">Explore Playtime <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
