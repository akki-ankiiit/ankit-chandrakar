import { useRef } from 'react';
import { grades } from '../../data/k-series.js';
import { pic } from './media.jsx';

export function Section({ id, eyebrow, title, lede, className = '', children }) {
  return <section id={id} className={`ks-section ks-inner ${className}`} aria-labelledby={`${id}-title`}><header className="ks-section-head"><p className="ks-eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2>{lede && <p className="ks-lede">{lede}</p>}</header>{children}</section>;
}

export function GradeTabs({ label, idPrefix, active, onChange }) {
  const refs = useRef([]);
  const onKeyDown = (event, index) => {
    const next = { ArrowRight: (index + 1) % grades.length, ArrowLeft: (index + grades.length - 1) % grades.length, Home: 0, End: grades.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };
  return <div className="ks-tabs" role="tablist" aria-label={label}>{grades.map((grade, index) => <button key={grade.id} ref={(element) => { refs.current[index] = element; }} type="button" role="tab" id={`${idPrefix}-tab-${grade.id}`} aria-selected={active === index} aria-controls={`${idPrefix}-panel`} tabIndex={active === index ? 0 : -1} style={{ '--grade': grade.colour, '--grade-ink': grade.ink }} onClick={() => onChange(index)} onKeyDown={(event) => onKeyDown(event, index)}>{grade.code}</button>)}</div>;
}

export function ShelfFigure({ grade }) {
  const alt = `${grade.code} front of pack — ${grade.english}`;
  return <figure className="ks-shelf-item" role="listitem"><div className="ks-shelf-bag">{pic(`${grade.id}-front`, alt, { sizes: '(max-width: 749px) 38vw, 200px' })}</div><figcaption>{grade.code}<span>{grade.use}</span></figcaption></figure>;
}
