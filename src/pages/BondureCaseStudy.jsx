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
const todo = (text) => (text.startsWith('TODO_USER') ? <mark className="bd-todo">{text}</mark> : text);
const [, figurePrefix, figureDigits, figureUnit] = results.figure.match(/^(\D*)(\d+)(.*)$/);

const chapters = [
  { id: 'bd-brief', label: 'The brief' },
  { id: 'bd-ideas', label: 'Ideas explored' },
  { id: 'bd-logo', label: 'The wordmark' },
  { id: 'bd-system', label: 'One family' },
  { id: 'bd-hq', label: 'Kamdhenu HQ' },
  { id: 'bd-details', label: 'Details on the bag' },
  { id: 'bd-results', label: 'Outcome' },
];

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

function ChapterIndex() {
  return (
    <nav className="bd-index" aria-label="Chapters">
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id}><a href={`#${chapter.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{chapter.label}</a></li>
        ))}
      </ol>
    </nav>
  );
}

function Brief() {
  return (
    <PkSection id="bd-brief" number="01" title={brief.heading} lede={brief.lede}>
      <p className="pk-callout"><strong>The challenge:</strong> {brief.challenge}</p>
      <Link className="text-link pk-link" to={kSeriesCard.href}>{brief.linkLabel}</Link>
    </PkSection>
  );
}

function Ideas() {
  return (
    <PkSection id="bd-ideas" number="02" title={ideas.heading} lede={todo(ideas.lede)}>
      <ol className="bd-ideas">
        {ideas.items.map((idea, index) => (
          <li key={index} className="bd-idea">
            <span className="bd-idea-no">Direction {index + 1}</span>
            <h3>{todo(idea.name)}</h3>
            <p>{todo(idea.text)}</p>
            <p className="bd-idea-set-aside"><b>Set aside.</b> {todo(idea.setAside)}</p>
          </li>
        ))}
      </ol>
    </PkSection>
  );
}

function Logo() {
  return (
    <PkSection id="bd-logo" number="03" title={logo.heading} lede={logo.lede}>
      <div className="bd-logo-panel pk-panel">
        {pic('logo', 'BONDURE wordmark logo', { className: 'bd-logo-main', loading: 'lazy' })}
        {pic('tejas', 'Tejas company logo', { className: 'bd-logo-tejas', loading: 'lazy' })}
      </div>
    </PkSection>
  );
}

function System() {
  return (
    <PkSection id="bd-system" number="04" title={system.heading} lede={system.lede}>
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
    <PkSection id="bd-hq" number="05" title={hq.heading} lede={hq.lede}>
      <ol className="bd-hq-steps">
        {hq.steps.map((step, index) => (
          <li key={step.title} className="bd-hq-step">
            <span className="bd-idea-no">Step {index + 1}</span>
            <h3>{step.title}</h3>
            <p>{todo(step.text)}</p>
          </li>
        ))}
      </ol>
    </PkSection>
  );
}

function Details() {
  return (
    <PkSection id="bd-details" number="06" title="Details that carry across the range." lede="Roof accents, four promises and proof at the bottom. The same details appear on all three bags.">
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
    <PkSection id="bd-results" number="07" title={results.heading} lede={results.lede}>
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
        <ChapterIndex />
        <Brief />
        <Ideas />
        <Logo />
        <System />
        <Hq />
        <Details />
        <Results />
        <PkRole id="bd-role" number="08" items={role} />
      </div>
      <PkPager current={bondureCard.id} />
    </article>
  );
}
