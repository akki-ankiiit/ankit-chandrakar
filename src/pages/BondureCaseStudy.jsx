import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { projects } from '../data/portfolio.js';
import { kSeriesCard } from '../data/k-series.js';
import { bondureHero, bondureImages as img, bondureMeta, brief, logo, notes, products, results, role, system } from '../data/bondure.js';

const pic = (key, alt, props = {}) => <img src={img[key].src} width={img[key].width} height={img[key].height} alt={alt} decoding="async" {...props} />;
const accent = (product) => ({ '--accent-product': product.accent });
const [, figurePrefix, figureDigits, figureUnit] = results.figure.match(/^(\D*)(\d+)(.*)$/);

function Heading({ number, eyebrow, id, children }) {
  return <div className="case-section-heading"><span className="chapter-number">{number}</span><div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{children}</h2></div></div>;
}

function Hero() {
  return (
    <header className="case-hero case-container">
      <div className="case-breadcrumb">
        <Link to="/#work" state={{ category: 'packaging-designs' }}><Icon name="arrow" size={15} />Back to selected work</Link>
        <span>PACKAGING &amp; IDENTITY / TEJAS</span>
      </div>
      <div className="case-title-row"><div><p className="eyebrow">Tejas</p><h1>{bondureHero.title}</h1><p className="case-subtitle">{bondureHero.subtitle}</p></div></div>
      <ul className="bd-meta" aria-label="Project details">{bondureHero.meta.map((item) => <li key={item}>{item}</li>)}</ul>
      <ul className="bd-bags" role="list" aria-label="The BONDURE range">
        {products.map((product, index) => (
          <li key={product.id} className={`bd-bag ${index === 1 ? 'is-middle' : ''}`} style={{ '--i': index }}>
            {pic(product.image, product.alt, index === 1 ? { fetchPriority: 'high' } : {})}
          </li>
        ))}
      </ul>
    </header>
  );
}

function Brief() {
  return (
    <section className="case-section" aria-labelledby="bd-brief">
      <Heading number="01" eyebrow="The brief" id="bd-brief">{brief.heading}</Heading>
      <p className="case-lead bd-copy">{brief.text}</p>
      <div className="challenge-note bd-challenge"><span className="paper-tape" aria-hidden="true" /><p><strong>The challenge:</strong> {brief.challenge}</p></div>
      <Link className="text-link bd-link" to={kSeriesCard.href}>{brief.linkLabel}</Link>
    </section>
  );
}

function Logo() {
  return (
    <section className="case-section" aria-labelledby="bd-logo">
      <Heading number="02" eyebrow="Identity" id="bd-logo">{logo.heading}</Heading>
      <div className="bd-logo-row">
        <div className="bd-logo-panel">
          {pic('logo', 'BONDURE wordmark logo', { className: 'bd-logo-main', loading: 'lazy' })}
          {pic('tejas', 'Tejas company logo', { className: 'bd-logo-tejas', loading: 'lazy' })}
        </div>
        <p className="case-lead bd-copy">{logo.text}</p>
      </div>
    </section>
  );
}

function Cards() {
  return (
    <ul className="bd-cards" role="list">
      {products.map((product) => (
        <li key={product.id} className="bd-card" style={accent(product)}>
          <div className="bd-card-art">{pic(product.image, product.alt, { loading: 'lazy' })}</div>
          <div className="bd-card-body">
            <h3>{product.name}</h3>
            <p className="bd-card-type">{product.type}</p>
            <p>{product.use}</p>
            <dl className="bd-card-facts">
              <div><dt>Colour</dt><dd><i aria-hidden="true" />{product.colour} <code>{product.accent}</code></dd></div>
              <div><dt>Pack size</dt><dd>{product.pack}</dd></div>
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Notes() {
  return (
    <div className="bd-notes">
      <div className="bd-note">
        <h3>{notes.roof.title}</h3>
        <p>{notes.roof.text}</p>
        <ul className="bd-roofs" role="list">
          {notes.roof.figures.map((figure) => <li key={figure.key}>{pic(figure.key, figure.alt, { loading: 'lazy' })}</li>)}
        </ul>
      </div>
      <div className="bd-note">
        <h3>{notes.promises.title}</h3>
        <ul className="bd-promises" role="list">
          {notes.promises.items.map((item) => <li key={item.key}>{pic(item.key, item.alt, { loading: 'lazy' })}<span>{item.label}</span></li>)}
        </ul>
      </div>
      <div className="bd-note bd-proof">
        <h3>{notes.proof.title}</h3>
        <p className="bd-label">{notes.proof.conforms}</p>
        {pic('conforms', notes.proof.conformsAlt, { className: 'bd-conforms', loading: 'lazy' })}
        <p className="bd-label">{notes.proof.weightLabel}</p>
        <ul className="bd-weights" role="list">
          {products.map((product) => <li key={product.id} style={accent(product)}><strong>{product.pack}</strong><span>{product.name}</span></li>)}
        </ul>
      </div>
    </div>
  );
}

function System() {
  return (
    <section className="case-section" aria-labelledby="bd-system">
      <Heading number="03" eyebrow="The system" id="bd-system">{system.heading}</Heading>
      <p className="case-lead bd-copy">{system.intro}</p>
      <Cards />
      <Notes />
    </section>
  );
}

function Results() {
  return (
    <section className="case-section" aria-labelledby="bd-results">
      <Heading number="04" eyebrow="The outcome" id="bd-results">{results.heading}</Heading>
      <div className="bd-result">
        <p className="bd-figure" aria-label={results.figure}><span aria-hidden="true">{figurePrefix}{figureDigits}<small>{figureUnit.trim()}</small></span></p>
        <div>
          <p className="bd-figure-label">{results.figureLabel}</p>
          <p className="case-lead">{results.text}</p>
          <ul className="bd-states" aria-label="States where the range is sold">{results.states.map((state) => <li key={state}>{state}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function Role() {
  return (
    <section className="case-section" aria-labelledby="bd-role">
      <Heading number="05" eyebrow="Lead Product Designer" id="bd-role">{role.heading}</Heading>
      <ul className="case-contributions bd-role" role="list">
        {role.items.map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}
      </ul>
    </section>
  );
}

export default function BondureCaseStudy() {
  usePageMeta(bondureMeta);
  const next = projects[0];

  return (
    <article className="case-study-page bd-page">
      <Hero />
      <div className="case-container bd-story">
        <Brief />
        <Logo />
        <System />
        <Results />
        <Role />
      </div>
      <nav className="bd-pager case-container" aria-label="More case studies">
        <Link className="bd-pager-link is-previous" to={kSeriesCard.href}>
          <span className="bd-pager-label">Previous case study</span>
          <span className="bd-pager-title"><Icon name="arrow" size={26} />{kSeriesCard.title}</span>
          <span className="bd-pager-note">{kSeriesCard.category}</span>
        </Link>
        <Link className="bd-pager-link is-next" to={`/work/${next.id}`}>
          <span className="bd-pager-label">Next case study</span>
          <span className="bd-pager-title">{next.title}<Icon name="arrow" size={26} /></span>
          <span className="bd-pager-note">{next.category}</span>
        </Link>
      </nav>
    </article>
  );
}

