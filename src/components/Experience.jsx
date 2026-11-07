import { education, experience, imagery, profile } from '../data/portfolio.js';
import { Pill, Reveal } from './ui.jsx';

export default function Experience() {
  return (
    <section id="experience" className="experience-section" aria-labelledby="experience-title">
      <div className="container experience-layout">
        <Reveal className="experience-intro"><p className="eyebrow">The chapters so far</p><h2 id="experience-title">A little context<br />behind the craft.</h2><p>From computer science to product design. Designing since 2023, including my internship, across privacy, business operations, and AI-assisted tools.</p><Pill href={profile.resume} download>Download résumé</Pill><img className="experience-ink-doodle" src={imagery.sketchbook} alt="" width="440" height="340" loading="lazy" /></Reveal>
        <div className="experience-timeline">
          {experience.map((job, index) => <Reveal key={job.company} className="experience-item" delay={index * 70}><span className="timeline-dot" /><div className="experience-meta"><span>{job.period}</span><span>{job.location}</span></div><h3>{job.company}</h3><p className="experience-role">{job.role}</p><p>{job.description}</p></Reveal>)}
          <Reveal className="education-card"><span className="timeline-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V3h14l-3 5 3 5H5" /></svg></span><div><span className="education-label">Where it began</span><h3>{education.degree}</h3><p>{education.school}</p><span className="education-period">{education.period}</span></div></Reveal>
        </div>
      </div>
    </section>
  );
}
