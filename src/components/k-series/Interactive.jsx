import { useState } from 'react';
import { back, front, grades } from '../../data/k-series.js';
import { GradeTabs, Heading } from './parts.jsx';
import { pic } from './media.jsx';

export function Front({ active, onChange }) {
  const [pin, setPin] = useState(0);
  const grade = grades[active];
  return (
    <section className="case-section" aria-labelledby="ks-front">
      <Heading number="06" eyebrow="The front" id="ks-front">{front.heading}</Heading>
      <GradeTabs label="Choose a grade to see its front" idPrefix="ks-front" active={active} onChange={onChange} />
      <div className="ks-front" id="ks-front-panel" role="tabpanel" aria-labelledby={`ks-front-tab-${grade.id}`} style={{ '--grade': grade.colour }}>
        <div className="ks-bag-panel">
          <div className="ks-bag" key={grade.id}>
            {pic(`${grade.id}-front`, `${grade.code} front of pack — ${grade.english}`, { loading: 'lazy' })}
            {front.pins.map((item, index) => (
              <button
                key={item.id} type="button" className={`ks-pin ${pin === index ? 'is-active' : ''}`}
                style={{ left: item.x, top: item.y }} aria-label={`Point ${item.id}: ${item.title}`} aria-pressed={pin === index}
                onClick={() => setPin(index)} onMouseEnter={() => setPin(index)} onFocus={() => setPin(index)}
              >{item.id}</button>
            ))}
          </div>
        </div>
        <div className="ks-front-copy">
          <ol className="ks-pin-list">
            {front.pins.map((item, index) => (
              <li key={item.id} className={pin === index ? 'is-active' : ''} onMouseEnter={() => setPin(index)}>
                <span>{item.id}</span><div><h3>{item.title}</h3><p>{item.text}</p></div>
              </li>
            ))}
          </ol>
          <p className="ks-front-note" aria-live="polite">{grade.frontNote}</p>
        </div>
      </div>
    </section>
  );
}

export function Back({ active, onChange }) {
  const grade = grades[active];
  return (
    <section className="case-section" aria-labelledby="ks-back">
      <Heading number="07" eyebrow="The back" id="ks-back">{back.heading}</Heading>
      <p className="case-lead ks-copy">{back.text}</p>
      <GradeTabs label="Choose a grade to see its back" idPrefix="ks-back" active={active} onChange={onChange} />
      <div className="ks-back" id="ks-back-panel" role="tabpanel" aria-labelledby={`ks-back-tab-${grade.id}`}>
        <div className="ks-bag-panel ks-bag-panel-back"><div className="ks-bag" key={grade.id}>{pic(`${grade.id}-back`, `${grade.code} back of pack with a 14-step pictogram guide and specification table`, { loading: 'lazy' })}</div></div>
        <div className="case-approach">
          {back.points.map((point, index) => <div key={point.title}><span className="approach-number">0{index + 1}</span><h3>{point.title}</h3><p>{point.text}</p></div>)}
        </div>
      </div>
      <ul className="ks-spec" aria-label="Specification">{back.spec.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}
