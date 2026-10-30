import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';
import { Reveal } from '../ui.jsx';
import { buyer, colour, grades, insight, kSeriesHero, naming, problem } from '../../data/k-series.js';
import { Heading, ShelfFigure } from './parts.jsx';
import { pic } from './media.jsx';

export function Hero() {
  return (
    <header className="case-hero case-container">
      <div className="case-breadcrumb">
        <Link to="/#work" state={{ category: 'packaging-designs' }}><Icon name="arrow" size={15} />Back to selected work</Link>
        <span>PACKAGING &amp; NAMING / KAMDHENU ADHESIVE</span>
      </div>
      <div className="case-title-row"><div><p className="eyebrow">Kamdhenu Adhesive</p><h1>{kSeriesHero.title}</h1><p className="case-subtitle">{kSeriesHero.subtitle}</p></div></div>
      <ul className="case-tags ks-meta" aria-label="Project details">{kSeriesHero.meta.map((item) => <li key={item}><span>{item}</span></li>)}</ul>
      <div className="ks-shelf" role="list">{grades.map((grade, index) => <ShelfFigure key={grade.id} grade={grade} index={index} />)}</div>
    </header>
  );
}

export function Problem() {
  return (
    <section className="case-section" aria-labelledby="ks-problem">
      <Heading number="01" eyebrow="The problem" id="ks-problem">{problem.heading}</Heading>
      {problem.paragraphs.map((text) => <p className="case-lead ks-copy" key={text}>{text}</p>)}
      <figure className="ks-stack">
        <div className="ks-stack-bags" aria-hidden="true">{grades.map((grade) => <div key={grade.id}>{pic(`${grade.id}-front-thumb`, '', { loading: 'lazy' })}</div>)}</div>
        <figcaption className="challenge-note"><span className="paper-tape" aria-hidden="true" /><p>{problem.caption}</p></figcaption>
      </figure>
    </section>
  );
}

export function Buyer() {
  return (
    <section className="case-section" aria-labelledby="ks-buyer">
      <Heading number="02" eyebrow="The buyer" id="ks-buyer">{buyer.heading}</Heading>
      <p className="case-lead ks-copy">{buyer.intro}</p>
      <div className="case-approach ks-columns">
        {buyer.columns.map((column, index) => <div key={column.title}><span className="approach-number">0{index + 1}</span><h3>{column.title}</h3><p>{column.text}</p></div>)}
      </div>
    </section>
  );
}

export function Insight() {
  return (
    <section className="case-section" aria-labelledby="ks-insight">
      <Heading number="03" eyebrow="The insight" id="ks-insight">{insight.heading}</Heading>
      <Reveal className="ks-type">
        <p aria-label="Fe500 becomes K50"><span className="ks-type-old" aria-hidden="true">Fe500</span><span className="ks-type-arrow" aria-hidden="true">→</span><span className="ks-type-new" aria-hidden="true">K50</span></p>
      </Reveal>
      {insight.paragraphs.map((text) => <p className="case-lead ks-copy" key={text}>{text}</p>)}
    </section>
  );
}

export function Naming() {
  return (
    <section className="case-section" aria-labelledby="ks-naming">
      <Heading number="04" eyebrow="The naming system" id="ks-naming">{naming.heading}</Heading>
      <ol className="ks-stairs">
        {grades.map((grade, index) => (
          <li key={grade.id} className="ks-stair" style={{ '--grade': grade.colour, '--grade-ink': grade.ink, '--step': index }}>
            <span className="ks-stair-code">{grade.code}</span>
            <strong>{grade.english}</strong>
            <span className="ks-hindi" lang="hi">{grade.hindi}</span>
            <p>{grade.use}</p>
          </li>
        ))}
      </ol>
      <div className="ks-axis" aria-hidden="true"><span>{naming.axis[0]}</span><i /><span>{naming.axis[1]}</span></div>
    </section>
  );
}

export function Colour() {
  return (
    <section className="case-section" aria-labelledby="ks-colour">
      <Heading number="05" eyebrow="Colour" id="ks-colour">{colour.heading}</Heading>
      <p className="case-lead ks-copy">{colour.text}</p>
      <div className="ks-swatches">
        {grades.map((grade) => (
          <figure key={grade.id} className="ks-swatch">
            {pic(`${grade.id}-colour`, `Bottom of the ${grade.code} bag: a solid field of the grade colour with the wave pattern`, { loading: 'lazy' })}
            <figcaption><strong>{grade.code}</strong><code>{grade.colour}</code><span>{grade.colourNote}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
