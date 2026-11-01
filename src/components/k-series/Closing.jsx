import { problem, recognition, results } from '../../data/k-series.js';
import { pic } from './media.jsx';

export function Results() {
  return <div className="ks-results">
    <h3>The result</h3><p className="ks-results-intro">{results.lede}</p>
    <div className="ks-result-grid">
      <div className="ks-result ks-panel"><p className="ks-eyebrow">Annual adhesive sales</p><p className="ks-result-comparison"><span>{problem.salesBefore.value}<small>Before</small></span><span aria-hidden="true">→</span><span>{results.figure}<small>After</small></span></p><p className="ks-caption">{results.figureLabel}</p></div>
      <div className="ks-supporting ks-panel">{results.supporting.map((item) => <p key={item.figure}><strong>{item.figure}</strong><span>{item.label}</span></p>)}</div>
    </div>
    <ul className="ks-spread" aria-label="Where the range is selling">{results.spread.map((item) => <li key={item.name}><span>{item.name}</span><small>{item.note}</small></li>)}</ul>
  </div>;
}

export function Recognition() {
  const brochure = recognition.figures.find((figure) => figure.key === 'signed-brochure');
  const { profile } = recognition;
  return <section id="ks-recognition" className="ks-founder" aria-label="Founder recognition">
    <div className="ks-recognition-profile">
      {pic(profile.imageKey, profile.alt, { className: 'ks-recognition-portrait', sizes: '(max-width: 1000px) 100px, 110px', loading: 'eager' })}
      <div className="ks-recognition-intro"><p className="ks-recognition-name"><strong>{profile.name}</strong></p><p className="ks-eyebrow ks-recognition-role">{profile.role}</p></div>
      <p className="ks-recognition-bio">{profile.bio}</p>
    </div>
    <figure className="ks-brochure">{pic(brochure.key, brochure.alt, { loading: 'eager', sizes: '(max-width: 749px) 86vw, (max-width: 1000px) calc((100vw - 102px) / 2), 440px' })}<figcaption>{brochure.caption}</figcaption></figure>
    <figure className="ks-quote"><blockquote><p>“{recognition.quote}”</p></blockquote><figcaption>{recognition.quoteCaption}</figcaption></figure>
  </section>;
}
