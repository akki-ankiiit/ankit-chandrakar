import { Link } from 'react-router-dom';
import '../styles/case-study-route.css';
import '../styles/packaging-case.css';
import '../styles/bondure.css';
import usePageMeta from '../hooks/usePageMeta.js';
import { PkHero, PkPager, PkRole, PkSection } from '../components/packaging/CaseParts.jsx';
import { kSeriesCard } from '../data/k-series.js';
import { bondureCard, bondureHero, bondureImages as img, bondureMeta, brief, hq, ideas, logo, notes, products, results, role, system } from '../data/bondure.js';

const pic = (key, alt, props = {}) => <img src={img[key].src} width={img[key].width} height={img[key].height} alt={alt} decoding="async" {...props} />;
const accent = (product) => ({ '--accent-product': product.accent });
// Placeholder copy ('TODO_USER…') is never shown: sections and items appear only once real text is supplied.
const filled = (text) => Boolean(text) && !text.startsWith('TODO_USER');
const ideaItems = ideas.items.filter((idea) => filled(idea.name) && filled(idea.text) && filled(idea.setAside));
const hqSteps = hq.steps.filter((step) => filled(step.text));
const hasIdeas = ideaItems.length > 0;
// Sequential chapter numbers that skip any hidden section.
const sectionIds = ['bd-brief', ...(hasIdeas ? ['bd-ideas'] : []), 'bd-logo', 'bd-system', 'bd-hq', 'bd-details', 'bd-results'];
const num = (id) => String(sectionIds.indexOf(id) + 1).padStart(2, '0');
const [, figurePrefix, figureDigits, figureUnit] = results.figure.match(/^(\D*)(\d+)(.*)$/);

function Bags() {
  return (
    <ul className="bd-bags" role="list" aria-label="The BONDURE range">
      {products.map((product, index) => (
        <li key={product.id} className={`bd-bag ${index === 1 ? 'is-middle' : ''}`} style={{ '--i': index }}>
          {pic(product.image, product.alt, index === 1 ? { fetchPriority: 'high' } : {})}
        </li>
      ))}
    </ul>
  );
}

function Brief() {
  return (
    <PkSection id="bd-brief" number={num('bd-brief')} title={brief.heading} lede={brief.lede}>
      <p className="pk-callout"><strong>The challenge:</strong> {brief.challenge}</p>
      <Link className="text-link pk-link" to={kSeriesCard.href}>{brief.linkLabel}</Link>
    </PkSection>
  );
}

function Ideas() {
  if (!hasIdeas) return null;
  return (
    <PkSection id="bd-ideas" number={num('bd-ideas')} title={ideas.heading} lede={filled(ideas.lede) ? ideas.lede : undefined}>
      <ol className="bd-ideas">
        {ideaItems.map((idea, index) => (
          <li key={idea.name} className="bd-idea">
            <span className="bd-idea-no">Direction {index + 1}</span>
            <h3>{idea.name}</h3>
            <p>{idea.text}</p>
            <p className="bd-idea-set-aside"><b>Set aside.</b> {idea.setAside}</p>
          </li>
        ))}
      </ol>
    </PkSection>
  );
}

function Logo() {
  return (
    <PkSection id="bd-logo" number={num('bd-logo')} title={logo.heading} lede={logo.lede}>
      <div className="bd-logo-panel pk-panel">
        {pic('logo', 'BONDURE wordmark logo', { className: 'bd-logo-main', loading: 'lazy' })}
        {pic('tejas', 'Tejas company logo', { className: 'bd-logo-tejas', loading: 'lazy' })}
      </div>
    </PkSection>
  );
}

function System() {
  return (
    <PkSection id="bd-system" number={num('bd-system')} title={system.heading} lede={system.lede}>
      <ul className="bd-cards" role="list">
        {products.map((product) => (
          <li key={product.id} className="bd-card" style={accent(product)}>
            <div className="bd-card-art">{pic(product.image, product.alt, { loading: 'lazy' })}</div>
            <div className="bd-card-body">
              <h3>{product.name}</h3>
              <p className="bd-card-type">{product.type}</p>
              <p className="bd-card-facts"><span><i aria-hidden="true" />{product.colour} <code>{product.accent}</code></span><span>{product.pack}</span></p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="pk-points bd-why">
        {system.why.map((point) => (
          <li key={point.title}><b>{point.title}</b><span>{point.text}</span></li>
        ))}
      </ul>
    </PkSection>
  );
}

function Hq() {
  return (
    <PkSection id="bd-hq" number={num('bd-hq')} title={hq.heading} lede={hq.lede} className={hqSteps.length ? '' : 'bd-hq-only'}>
      {hqSteps.length > 0 && <ol className="bd-hq-steps">
        {hqSteps.map((step, index) => (
          <li key={step.title} className="bd-hq-step">
            <span className="bd-idea-no">Step {index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>}
    </PkSection>
  );
}

function Details() {
  return (
    <PkSection id="bd-details" number={num('bd-details')} title="Details that carry across the range." lede="Roof accents, four promises and proof at the bottom. The same details appear on all three bags.">
      <div className="bd-details">
        <div className="bd-detail pk-panel">
          <h3>{notes.roof.title}</h3>
          <p>{notes.roof.text}</p>
          <ul className="bd-roofs" role="list">{notes.roof.figures.map((figure) => <li key={figure.key}>{pic(figure.key, figure.alt, { loading: 'lazy' })}</li>)}</ul>
        </div>
        <div className="bd-detail pk-panel">
          <h3>{notes.promises.title}</h3>
          <p>{notes.promises.text}</p>
          <ul className="bd-promises" role="list">{notes.promises.items.map((item) => <li key={item.key}>{pic(item.key, item.alt, { loading: 'lazy' })}<span>{item.label}</span></li>)}</ul>
        </div>
        <div className="bd-detail pk-panel">
          <h3>{notes.proof.title}</h3>
          <p>{notes.proof.text}</p>
          {pic('conforms', notes.proof.conformsAlt, { className: 'bd-conforms', loading: 'lazy' })}
          <ul className="bd-weights" role="list" aria-label="Net weight">{products.map((product) => <li key={product.id} style={accent(product)}><strong>{product.pack}</strong><span>{product.name}</span></li>)}</ul>
        </div>
      </div>
    </PkSection>
  );
}

function Results() {
  return (
    <PkSection id="bd-results" number={num('bd-results')} title={results.heading} lede={results.lede}>
      <div className="bd-result pk-panel">
        <div>
          <p className="pk-figure"><span className="sr-only">{results.figure}</span><span aria-hidden="true">{figurePrefix}{figureDigits}<small>{figureUnit.trim()}</small></span></p>
          <p className="pk-figure-label">{results.figureLabel}</p>
        </div>
        <ul className="bd-states" aria-label="States where the range is sold">{results.states.map((state) => <li key={state}>{state}</li>)}</ul>
      </div>
    </PkSection>
  );
}

export default function BondureCaseStudy() {
  usePageMeta(bondureMeta);

  return (
    <article className="case-study-page pk-page bd-page">
      <PkHero crumb="PACKAGING & IDENTITY / TEJAS" client="Tejas" title={bondureHero.title} subtitle={bondureHero.subtitle} facts={bondureHero.facts}>
        <Bags />
      </PkHero>
      <div className="case-container pk-story">
        <Brief />
        <Ideas />
        <Logo />
        <System />
        <Hq />
        <Details />
        <Results />
        <PkRole id="bd-role" number={String(sectionIds.length + 1).padStart(2, '0')} items={role} />
      </div>
      <PkPager current={bondureCard.id} />
    </article>
  );
}
