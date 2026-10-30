import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Pill } from '../components/ui.jsx';
import { Back, Front } from '../components/k-series/Interactive.jsx';
import { Approval, Founder, MyRole, Recognition, Results } from '../components/k-series/Closing.jsx';
import { Buyer, Colour, Hero, Insight, Naming, Problem } from '../components/k-series/StorySections.jsx';
import { profile, projects } from '../data/portfolio.js';
import { kSeriesMeta } from '../data/k-series.js';

function setMeta(name, value) {
  const attribute = name.startsWith('og:') ? 'property' : 'name';
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  const created = !element;
  if (created) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  const previous = element.getAttribute('content');
  element.setAttribute('content', value);
  return () => (created ? element.remove() : element.setAttribute('content', previous));
}

export default function KSeriesCaseStudy() {
  const [active, setActive] = useState(3);
  const [progress, setProgress] = useState(0);
  const article = useRef(null);
  const next = projects[0];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = kSeriesMeta.title;
    const restore = [
      setMeta('description', kSeriesMeta.description),
      setMeta('og:title', kSeriesMeta.title),
      setMeta('og:description', kSeriesMeta.description),
      setMeta('og:image', new URL(kSeriesMeta.image, window.location.origin).href),
    ];
    const update = () => {
      if (!article.current) return;
      const rect = article.current.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight))));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      restore.forEach((undo) => undo());
      document.title = previousTitle;
    };
  }, []);

  return (
    <article className="case-study-page ks-page page-enter" ref={article}>
      <div className="case-reading-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <Hero />
      <div className="case-container ks-story">
        <Problem />
        <Buyer />
        <Insight />
        <Naming />
        <Colour />
        <Front active={active} onChange={setActive} />
        <Back active={active} onChange={setActive} />
        <Approval />
        <Results />
        <Founder />
        <Recognition />
        <MyRole />
        <div className="case-endnote"><span>Thanks for looking through my notes.</span></div>
      </div>
      <section className="case-next case-container"><div><p className="eyebrow">There’s another story in the folder</p><Link to={`/work/${next.id}`}><h2>{next.title}</h2><Icon name="arrow" size={30} /></Link><p>{next.subtitle}</p></div><Link to={`/work/${next.id}`} tabIndex={-1} aria-hidden="true"><img src={next.image} alt="" width="1200" height="850" loading="lazy" /></Link></section>
      <div className="case-contact-note"><p>Working through something similar?</p><Pill href={`mailto:${profile.email}?subject=${encodeURIComponent('Let’s talk about K-Series')}`}>Let’s compare notes</Pill></div>
    </article>
  );
}
