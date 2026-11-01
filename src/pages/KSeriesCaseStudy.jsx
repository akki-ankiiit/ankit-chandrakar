import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import { PkPager } from '../components/packaging/CaseParts.jsx';
import { Back, Front } from '../components/k-series/Interactive.jsx';
import { Recognition, Results } from '../components/k-series/Closing.jsx';
import { Listening, Naming, Problem, Shelf, StrategyShift } from '../components/k-series/StorySections.jsx';
import { Section } from '../components/k-series/parts.jsx';
import { pic } from '../components/k-series/media.jsx';
import { kSeriesCard, kSeriesHero, kSeriesImages, kSeriesMeta, kSeriesPath, recognition, role } from '../data/k-series.js';

const cover = kSeriesImages['k90-front'];
const meta = { ...kSeriesMeta, path: kSeriesPath, imageWidth: cover.width, imageHeight: cover.height, imageAlt: 'K-Series K90 front of pack' };
const workState = { category: 'packaging-designs', focusProject: kSeriesCard.id };

export default function KSeriesCaseStudy() {
  usePageMeta(meta);
  const [active, setActive] = useState(0);
  const portrait = recognition.figures.find((figure) => figure.key === 'me-and-sunil');

  return <article className="case-study-page pk-page ks-page">
    <header className="ks-hero ks-inner">
      <nav className="ks-breadcrumb" aria-label="Case study"><Link to="/#work" state={workState}>← Back to selected work</Link></nav>
      <div className="ks-hero-layout">
        <figure className="ks-hero-photo">
          {pic(portrait.key, portrait.alt, { loading: 'eager', fetchPriority: 'high', sizes: '(max-width: 419px) 86vw, (max-width: 749px) 360px, (max-width: 1000px) calc((100vw - 102px) / 2), 390px' })}
          <figcaption>{portrait.caption}</figcaption>
        </figure>
        <Recognition />
      </div>
      <div className="ks-hero-copy">
        <p className="ks-eyebrow">Kamdhenu Adhesive / Packaging & naming</p>
        <h1>{kSeriesHero.title}</h1>
        <p className="ks-hero-subtitle">A clearer way to choose tile adhesive: four familiar grades, four distinct colours, and packaging built around the people who sell and use it.</p>
      </div>
      <dl className="ks-facts">{kSeriesHero.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === 'Outcome' ? '₹1–1.5 Cr to ₹20 Cr a year' : value}</dd></div>)}</dl>
      <div className="ks-range-overview" aria-labelledby="ks-range-title">
        <div className="ks-overview-heading"><h2 id="ks-range-title">The finished range</h2><p>One grade, one colour, one job.</p></div>
        <Shelf />
      </div>
    </header>
    <Problem /><Listening /><Naming />
    <Front active={active} onChange={setActive} /><Back active={active} onChange={setActive} />
    <Section id="ks-results" eyebrow="06 / Strategy & results" title="From packaging to a sales pitch" lede="A clearer range gave dealers a simpler way to explain the right adhesive for each job.">
      <StrategyShift /><Results />
    </Section>
    <Section id="ks-role" eyebrow="07 / My role" title="From field research to the final bag" lede="Ankit Chandrakar / Lead Product Designer">
      <ul className="ks-role">{role.map((item) => <li key={item}>{item}</li>)}</ul>
      <Link className="ks-text-link ks-back-work" to="/#work" state={workState}>← Back to selected work</Link>
    </Section>
    <PkPager current={kSeriesCard.id} />
  </article>;
}
