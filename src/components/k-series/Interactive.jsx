import { useState } from 'react';
import { back, front, grades } from '../../data/k-series.js';
import { GradeTabs, Section } from './parts.jsx';
import { pic } from './media.jsx';

export function Front({ active, onChange }) {
  const [pin, setPin] = useState(0);
  const grade = grades[active];
  return (
    <Section id="ks-front" eyebrow="05 / Front of pack" title={front.heading} lede={front.lede}>
      <GradeTabs label="Choose a grade to see its front" idPrefix="ks-front" active={active} onChange={onChange} />
      <div className="ks-front" id="ks-front-panel" role="tabpanel" tabIndex={0} aria-labelledby={`ks-front-tab-${grade.id}`} style={{ '--grade': grade.colour }}>
        <div className="ks-bag-panel">
          <div className="ks-bag" key={grade.id}>
            {pic(`${grade.id}-front`, `${grade.code} front of pack — ${grade.english}`, { sizes: '(max-width: 749px) 78vw, (max-width: 1000px) 40vw, 410px' })}
            {front.pins.map((item, index) => (
              <button
                key={item.id} type="button" className={`ks-pin is-${item.side}${pin === index ? ' is-active' : ''}`}
                style={{ top: item.y }} aria-label={`Point ${item.id}: ${item.title}`} aria-pressed={pin === index} aria-controls={`ks-front-detail-${item.id}`}
                onClick={() => setPin(index)} onMouseEnter={() => setPin(index)} onFocus={() => setPin(index)}
              >{item.id}</button>
            ))}
          </div>
        </div>
        <ol className="ks-pin-list">
          {front.pins.map((item, index) => (
            <li key={item.id} id={`ks-front-detail-${item.id}`} className={pin === index ? 'is-active' : ''} onMouseEnter={() => setPin(index)}>
              <span>{item.id}</span><div><h3>{item.title}</h3><p>{item.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function Back({ active, onChange }) {
  const grade = grades[active];
  return (
    <Section id="ks-back" eyebrow="06 / Back of pack" title={back.heading} lede={back.lede}>
      <GradeTabs label="Choose a grade to see its back" idPrefix="ks-back" active={active} onChange={onChange} />
      <div className="ks-back" id="ks-back-panel" role="tabpanel" tabIndex={0} aria-labelledby={`ks-back-tab-${grade.id}`}>
        <div className="ks-bag-panel"><div className="ks-bag ks-bag-back" key={grade.id}>{pic(`${grade.id}-back`, `${grade.code} back of pack with a 14-step pictogram guide and specification table`, { sizes: '(max-width: 749px) 78vw, (max-width: 1000px) 40vw, 410px' })}</div></div>
        <div>
          <ul className="ks-back-points" role="list">
            {back.points.map((point) => <li key={point.title}><b>{point.title}</b><span>{point.text}</span></li>)}
          </ul>
          <ul className="ks-spec" aria-label="Specification">{back.spec.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}
