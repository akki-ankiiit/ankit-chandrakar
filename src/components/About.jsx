import { Link } from 'react-router-dom';
import { imagery, profile } from '../data/portfolio.js';
import { Reveal, Selection } from './ui.jsx';
import Icon from './Icon.jsx';

export default function About() {
  const disciplines = ['Enterprise SaaS', 'AI-powered products', 'Design systems', 'Privacy technology', 'Product strategy', 'Thoughtful interactions'];
  return (
    <>
      <section id="bio" className="about" aria-label="About Ankit">
        <div className="about-inner">
          <Reveal className="portrait-wrap">
            <div className="about-portrait-frame">
              <img className="portrait" src={imagery.portrait} alt="Ankit Chandrakar" width="724" height="543" loading="lazy" />
            </div>
            <p className="about-portrait-caption">always a work in curiosity.</p>
          </Reveal>
          <Reveal className="about-copy" delay={100}>
            <h2 className="eyebrow"><Selection><img src={imagery.mark} width="27" height="30" alt="" /></Selection>{profile.role}</h2>
            <p>{profile.bio}</p>
            <p className="design-philosophy">{profile.philosophy}</p>
             <Link className="text-link about-resume" to="/about">More about my practice <Icon name="arrow" size={14} /></Link>
          </Reveal>
        </div>
      </section>
      <div className="discipline-marquee" aria-label="Design specialisms">
        <div className="marquee-track">
          {[0, 1].map((copy) => <div className="discipline-track" key={copy} aria-hidden={copy === 1}>{disciplines.map((item) => <span key={item}><Icon size={13} />{item}</span>)}</div>)}
        </div>
      </div>
    </>
  );
}
