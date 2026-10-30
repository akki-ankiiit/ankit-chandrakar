import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../ui.jsx';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { approval, founder, grades, kSeriesImages as img, recognition, results, role } from '../../data/k-series.js';
import { Heading } from './parts.jsx';
import { pic } from './media.jsx';

const cities = {
  raipur: { x: 450, y: 232 },
  nagpur: { x: 215, y: 268 },
  bhopal: { x: 105, y: 92 },
  moreTop: { x: 548, y: 130 },
  moreBottom: { x: 556, y: 334 },
};

function Approval() {
  return (
    <section className="case-section" aria-labelledby="ks-approval">
      <Heading number="08" eyebrow="The approval" id="ks-approval">{approval.heading}</Heading>
      <p className="case-lead ks-copy">{approval.text}</p>
      <ol className="ks-timeline">
        {approval.steps.map((step, index) => (
          <li key={step.title}>
            <Reveal delay={index * 80} className="ks-timeline-step">
              <span className="approach-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
      <ul className="ks-bag-row" aria-label="All eight K-Series bags, front and back">
        {grades.flatMap((grade) => [
          <li key={`${grade.id}-front`}>{pic(`${grade.id}-front-thumb`, `${grade.code} front of pack`, { loading: 'lazy' })}</li>,
          <li key={`${grade.id}-back`}>{pic(`${grade.id}-back-thumb`, `${grade.code} back of pack`, { loading: 'lazy' })}</li>,
        ])}
      </ul>
    </section>
  );
}

const MAP_W = 600;
const MAP_H = 380;
const pct = (value, total) => ((value / total) * 100).toFixed(2);
const [, figurePrefix, figureDigits, figureSuffix] = results.figure.match(/^(\D*)(\d+)(.*)$/);
const figureTarget = Number(figureDigits);

function MapLabel({ point, placement, className = '', children }) {
  return (
    <span className={`ks-map-label is-${placement} ${className}`} style={{ '--x': pct(point.x, MAP_W), '--y': pct(point.y, MAP_H) }}>{children}</span>
  );
}

function ResultsMap() {
  const r = cities.raipur;
  const n = cities.nagpur;
  const b = cities.bhopal;
  const moreTop = cities.moreTop;
  const moreBottom = cities.moreBottom;

  return (
    <figure className="ks-map">
      <div className="ks-map-stage">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-labelledby="ks-map-title ks-map-desc">
          <title id="ks-map-title">Map of K-Series sales spread from Raipur</title>
          <desc id="ks-map-desc">Raipur is the origin. Solid lines reach Nagpur and Bhopal, and dashed lines lead to more cities across central India.</desc>
          {[80, 160, 240, 320].map((radius) => <circle key={radius} className="ks-map-ring" cx={r.x} cy={r.y} r={radius} />)}
          <path className="ks-map-dash" d={`M${r.x} ${r.y} L${moreTop.x} ${moreTop.y}`} />
          <path className="ks-map-dash" d={`M${r.x} ${r.y} L${moreBottom.x} ${moreBottom.y}`} />
          <path className="ks-map-line" pathLength="1" d={`M${r.x} ${r.y} Q 300 140 ${b.x} ${b.y}`} />
          <path className="ks-map-line" pathLength="1" d={`M${r.x} ${r.y} L${n.x} ${n.y}`} />
          <circle className="ks-map-pulse" cx={r.x} cy={r.y} r="9" />
          <circle className="ks-map-pulse ks-map-pulse-late" cx={r.x} cy={r.y} r="9" />
          <circle className="ks-map-more-dot" cx={moreTop.x} cy={moreTop.y} r="5" />
          <circle className="ks-map-more-dot" cx={moreBottom.x} cy={moreBottom.y} r="5" />
          <circle className="ks-map-dot" cx={b.x} cy={b.y} r="6" />
          <circle className="ks-map-dot" cx={n.x} cy={n.y} r="6" />
          <circle className="ks-map-origin" cx={r.x} cy={r.y} r="9" />
        </svg>
        <MapLabel point={b} placement="above">Bhopal</MapLabel>
        <MapLabel point={n} placement="below">Nagpur</MapLabel>
        <MapLabel point={r} placement="origin">Raipur, origin</MapLabel>
        <MapLabel point={moreTop} placement="more">and more cities</MapLabel>
      </div>
    </figure>
  );
}

function Results() {
  const board = useRef(null);
  const [drawn, setDrawn] = useState(false);
  const [count, setCount] = useState(0);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const element = board.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDrawn(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!drawn || reduceMotion) return undefined;
    const duration = 1400;
    let frame;
    let start;
    const tick = (now) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      setCount(Math.round(figureTarget * (1 - 2 ** (-10 * progress))));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setCount(figureTarget);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [drawn, reduceMotion]);

  const shown = reduceMotion ? figureTarget : count;

  return (
    <section className="case-section" aria-labelledby="ks-results">
      <Heading number="09" eyebrow="The results" id="ks-results">{results.heading}</Heading>
      <div className={`ks-result-board${drawn ? ' is-drawn' : ''}`} ref={board}>
        <div className="ks-result">
          <p className="ks-figure" aria-label={results.figure}>
            <span aria-hidden="true">
              {figurePrefix}
              <span className="ks-figure-num"><span className="ks-figure-ghost">{figureDigits}</span><span>{shown}</span></span>
              <span className="ks-figure-unit">{figureSuffix.trim()}</span>
            </span>
          </p>
          <p className="ks-figure-label">{results.figureLabel}</p>
          <p className="ks-result-text">{results.text}</p>
        </div>
        <ResultsMap />
        <ol className="ks-spread" aria-label="Where the range is selling">
          {results.spread.map((item, index) => (
            <li key={item.name} className={`is-${item.kind}`} style={{ '--i': index }}>
              <span className="ks-spread-name"><i aria-hidden="true" />{item.name}</span>
              <span className="ks-spread-note">{item.note}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="case-section ks-founder-section" aria-labelledby="ks-founder">
      <Heading number="10" eyebrow={founder.label} id="ks-founder">{founder.heading}</Heading>
      <div className="ks-founder">
        <figure className="ks-portrait">
          <img src="/assets/sunil.png" width="690" height="776" alt="Sunil Agrawal, founder of Kamdhenu Group" loading="lazy" decoding="async" />
        </figure>
        <div>
          {founder.paragraphs.map((text) => <p className="case-lead ks-copy" key={text}>{text}</p>)}
          <dl className="case-facts ks-founder-facts">
            {founder.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Recognition() {
  return (
    <section className="case-section" aria-labelledby="ks-recognition">
      <Heading number="11" eyebrow="Recognition" id="ks-recognition">{recognition.heading}</Heading>
      <p className="case-lead ks-copy">{recognition.text}</p>
      <figure className="ks-quote">
        <blockquote><p>“{recognition.quote}”</p></blockquote>
        <figcaption>{recognition.quoteCaption}</figcaption>
      </figure>
      <div className="ks-moment">
        {recognition.figures.map((figure, index) => (
          <Reveal key={figure.key} delay={index * 80} className="ks-moment-item">
            <figure>
              <img src={img[figure.key].src} width={img[figure.key].width} height={img[figure.key].height} alt={figure.alt} loading="lazy" decoding="async" />
              <figcaption>{figure.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function MyRole() {
  return (
    <section className="case-section" aria-labelledby="ks-role">
      <Heading number="12" eyebrow="My role" id="ks-role">{role.heading}</Heading>
      <p className="case-lead ks-copy">{role.text}</p>
      <dl className="ks-deliverables">
        {role.deliverables.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <div className="ks-logos">
        <img src={img['logo-adhesive'].src} width={img['logo-adhesive'].width} height={img['logo-adhesive'].height} alt="Kamdhenu Adhesive logo" loading="lazy" />
        <img src={img['logo-group'].src} width={img['logo-group'].width} height={img['logo-group'].height} alt="Kamdhenu Group logo" loading="lazy" />
      </div>
    </section>
  );
}

export { Approval, Results, Founder, Recognition, MyRole };
