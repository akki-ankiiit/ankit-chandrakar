import { grades, insight, listening, naming, oldBags, problem, researchFindings, strategyShift } from '../../data/k-series.js';
import { Section, ShelfFigure } from './parts.jsx';
import { pic } from './media.jsx';

export function Shelf() {
  return <div className="ks-shelf" role="list">{grades.map((grade) => <ShelfFigure key={grade.id} grade={grade} />)}</div>;
}

export function Problem() {
  return <Section id="ks-problem" eyebrow="02 / The problem" title={problem.heading} lede={problem.lede}>
    <div className="ks-old-range ks-panel">
      <div className="ks-old-bags">{oldBags.map((bag, index) => <figure key={bag.key}>
        {pic(bag.key, bag.alt, { sizes: '(max-width: 749px) 110px, 150px' })}<figcaption>{problem.names[index]}</figcaption>
      </figure>)}</div>
      <p className="ks-caption">{problem.caption}</p>
    </div>
    <div className="ks-problem-bottom">
      <p className="ks-before-stat"><span>{problem.salesBefore.label}</span><strong>{problem.salesBefore.value}</strong></p>
      <ol className="ks-issues">{problem.issues.map((issue) => <li key={issue}>{issue}</li>)}</ol>
    </div>
  </Section>;
}

export function Listening() {
  return <Section id="ks-research" eyebrow="03 / Research" title={listening.heading} lede="Two rounds of conversations connected the sales counter with the people using the adhesive on site.">
    <ul className="ks-methods" aria-label="Research methods">{listening.methods.map((method) => <li key={method}>{method}</li>)}</ul>
    {listening.interviewCount && <p className="ks-caption">{listening.interviewCount}</p>}
    <div className="ks-research-grid">{[listening.round1, listening.round2].map((round, index) => <div className="ks-research-panel ks-panel" key={round.who}>
      <p className="ks-eyebrow">Round {index + 1} / {index === 0 ? 'The sales counter' : 'The job site'}</p>
      <h3>{round.who}</h3><p className="ks-research-where">{round.where}</p>
      <ul>{round.learned.map((text) => <li key={text}>{text}</li>)}</ul>
    </div>)}</div>
    <div className="ks-findings" aria-label="Research findings and design responses">{researchFindings.map((item) => <div className="ks-finding" key={item.finding}>
      <h3>{item.finding}</h3><p><span aria-hidden="true">→ </span>{item.designResponse}</p>
    </div>)}</div>
  </Section>;
}

export function Naming() {
  return <Section id="ks-naming" eyebrow="04 / Naming & colour" title={naming.heading} lede={naming.lede}>
    <div className="ks-insight ks-panel">
      <p className="ks-grade-transform" aria-label="Fe500 becomes K50"><span>{insight.steelGradeExample[0]}</span><span aria-hidden="true">→</span><span>{insight.steelGradeExample[1]}</span></p>
      <div><h3>{insight.heading}</h3><p>{insight.lede}</p></div>
    </div>
    <div className="ks-grade-cards">{grades.map((grade) => <div className="ks-grade-card" key={grade.id} style={{ '--grade': grade.colour }}>
      <div className="ks-grade-card-heading"><h3>{grade.code}</h3><span>{naming.ladder[grade.id]}</span></div>
      <p className="ks-grade-english">{grade.english}</p><p className="ks-hindi" lang="hi">{grade.hindi}</p>
      <p className="ks-grade-use">{grade.use}</p>
    </div>)}</div>
    <p className="ks-axis"><span>{naming.axis[0]}</span><span aria-hidden="true">→</span><span>{naming.axis[1]}</span></p>
  </Section>;
}

export function StrategyShift() {
  return <ul className="ks-strategy-points">{strategyShift.points.map((point) => <li key={point}>{point}</li>)}</ul>;
}
