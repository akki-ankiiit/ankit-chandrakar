import { useRef } from 'react';
import { Selection } from '../ui.jsx';
import { grades } from '../../data/k-series.js';
import { pic } from './media.jsx';

export function Heading({ number, eyebrow, children, id }) {
  return <div className="case-section-heading"><span className="chapter-number">{number}</span><div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{children}</h2></div></div>;
}

// Accessible grade tabs: role=tablist, roving tabindex, Arrow/Home/End keys.
export function GradeTabs({ label, idPrefix, active, onChange }) {
  const refs = useRef([]);
  const onKeyDown = (event, index) => {
    const next = { ArrowRight: (index + 1) % grades.length, ArrowLeft: (index + grades.length - 1) % grades.length, Home: 0, End: grades.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div className="ks-tabs" role="tablist" aria-label={label}>
      {grades.map((grade, index) => (
        <button
          key={grade.id}
          ref={(element) => { refs.current[index] = element; }}
          type="button" role="tab" id={`${idPrefix}-tab-${grade.id}`}
          aria-selected={active === index} aria-controls={`${idPrefix}-panel`}
          tabIndex={active === index ? 0 : -1}
          style={{ '--grade': grade.colour, '--grade-ink': grade.ink }}
          onClick={() => onChange(index)} onKeyDown={(event) => onKeyDown(event, index)}
        >{grade.code}</button>
      ))}
    </div>
  );
}

export function ShelfFigure({ grade, index }) {
  return (
    <figure className="ks-shelf-item" role="listitem" style={{ '--i': index }}>
      <Selection>{pic(`${grade.id}-front`, `${grade.code} front of pack — ${grade.english}`, index === 0 ? { fetchPriority: 'high' } : { loading: 'lazy' })}</Selection>
      <figcaption><strong style={{ color: grade.id === 'k60' ? '#8a7400' : grade.colour }}>{grade.code}</strong><span>{grade.english}</span></figcaption>
    </figure>
  );
}
