import { problem, recognition, results } from '../../data/k-series.js';
import { pic } from './media.jsx';

export function Results() {
  return <div className="ks-results">
    <h3>{results.heading}</h3>
    <div className="ks-result-grid">
      <div className="ks-result ks-panel"><p className="ks-eyebrow">Annual adhesive sales</p><p className="ks-result-comparison"><span>{problem.salesBefore.value}<small>Before</small></span><span aria-hidden="true">→</span><span>{results.figure}<small>After</small></span></p><p className="ks-caption">{results.figureLabel}</p></div>
      <div className="ks-supporting ks-panel">{results.supporting.map((item) => <p key={item.figure}><strong>{item.figure}</strong><span>{item.label}</span></p>)}</div>
    </div>
    <ul className="ks-spread" aria-label="Where the range is selling">{results.spread.map((item) => <li key={item.name} className={`is-${item.kind}`}><span>{item.name}</span><small>{item.note}</small></li>)}</ul>
  </div>;
}

export function Approval() {
  const { profile } = recognition;
  const portrait = recognition.figures.find((figure) => figure.key === 'me-and-sunil');
  const brochure = recognition.figures.find((figure) => figure.key === 'signed-brochure');
  return <div className="ks-approval">
    <div className="ks-approval-photos">
      <figure>{pic(profile.imageKey, profile.alt, { sizes: '(max-width: 749px) 45vw, 540px' })}<figcaption>{profile.name}, {profile.role}</figcaption></figure>
      <figure>{pic(portrait.key, portrait.alt, { sizes: '(max-width: 749px) 45vw, 540px' })}<figcaption>{portrait.caption}</figcaption></figure>
    </div>
    <div className="ks-approval-bottom">
      <div className="ks-approval-copy">
        <p className="ks-recognition-name">{profile.name}</p>
        <p className="ks-eyebrow">{profile.role}</p>
        <p className="ks-approval-bio">{profile.bio}</p>
        <figure className="ks-quote"><blockquote><p>“{recognition.quote}”</p></blockquote><figcaption>{recognition.quoteCaption}</figcaption></figure>
      </div>
      <figure className="ks-approval-brochure">{pic(brochure.key, brochure.alt, { sizes: '(max-width: 749px) 90vw, 540px' })}<figcaption>{brochure.caption}</figcaption></figure>
    </div>
  </div>;
}
