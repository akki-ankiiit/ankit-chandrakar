import { useState } from 'react';
import '../styles/case-study-route.css';
import '../styles/packaging-case.css';
import '../styles/k-series.css';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { PkPager } from '../components/packaging/CaseParts.jsx';
import { Back, Front } from '../components/k-series/Interactive.jsx';
import { Approval, Results } from '../components/k-series/Closing.jsx';
import { Listening, Naming, Problem, Shelf, StrategyShift } from '../components/k-series/StorySections.jsx';
import { Section } from '../components/k-series/parts.jsx';
import { kSeriesCard, kSeriesHero, kSeriesImages, kSeriesMeta, kSeriesPath, recognition, role, strategyShift } from '../data/k-series.js';

const cover = kSeriesImages['k90-front'];
const meta = { ...kSeriesMeta, path: kSeriesPath, imageWidth: cover.width, imageHeight: cover.height, imageAlt: 'K-Series K90 front of pack' };
const workState = { category: 'packaging-designs', focusProject: kSeriesCard.id };

export default function KSeriesCaseStudy() {
  usePageMeta(meta);
  const [active, setActive] = useState(0);

  return <article className="case-study-page pk-page ks-page">
    <header className="ks-hero ks-inner">
      <nav className="ks-breadcrumb" aria-label="Case study"><ProjectBackLink state={workState} /></nav>
      <Section id="ks-approval" eyebrow="01 / Approval" title={recognition.heading} lede={recognition.lede} className="ks-approval-section">
        <Approval />
      </Section>
      <p className="ks-eyebrow">Kamdhenu Adhesive / Packaging & naming</p>
      <h1 className="sr-only">{kSeriesHero.title}</h1>
      <p className="ks-hero-subtitle">{kSeriesHero.subtitle}</p>
      <div className="ks-range-overview" aria-labelledby="ks-range-title">
        <div className="ks-overview-heading"><h2 id="ks-range-title">The finished range</h2><p>One grade, one colour, one job.</p></div>
        <Shelf />
      </div>
      <dl className="ks-facts">{kSeriesHero.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === 'Outcome' ? '₹1–1.5 Cr to ₹20 Cr a year' : value}</dd></div>)}</dl>
    </header>
    <Problem />
    <Listening />
    <Naming />
    <Front active={active} onChange={setActive} />
    <Back active={active} onChange={setActive} />
    <Section id="ks-results" eyebrow="07 / Strategy & results" title={strategyShift.heading} lede="A clearer range gave dealers a simpler way to explain the right adhesive for each job.">
      <StrategyShift />
      <Results />
    </Section>
    <Section id="ks-role" eyebrow="My role" title="From field research to the final bag" lede="Ankit Chandrakar / Lead Product Designer">
      <ul className="ks-role">{role.map((item) => <li key={item}>{item}</li>)}</ul>
      <ProjectBackLink className="ks-back-work" state={workState} />
    </Section>
    <PkPager current={kSeriesCard.id} />
  </article>;
}
