import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { Pill } from './ui.jsx';
import { profile } from '../data/portfolio.js';

export default function ProjectDialog({ project, onClose, onPrevious, onNext, position, total }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const focusTarget = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; focusTarget?.focus(); };
  }, []);
  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: 'instant' }); }, [project.id]);

  return (
    <dialog ref={ref} className="project-dialog" aria-labelledby="project-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === ref.current) onClose(); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') onPrevious(); if (event.key === 'ArrowRight') onNext(); }}>
      <div className="dialog-inner">
        <button className="dialog-close icon-button" onClick={onClose} aria-label="Close project"><Icon name="close" size={20} /></button>
        <div className="dialog-image" key={project.id}><img src={project.image} alt={project.title} width="1200" height="850" loading="lazy" decoding="async" /></div>
        <div className="dialog-copy">
          <div className="dialog-topline"><p className="eyebrow">{project.category}</p><span className="project-count">{String(position + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></div>
          <h2 id="project-title">{project.title}</h2>
          <p className="dialog-client">{project.client} · {project.year}</p>
          <div className="project-facts"><div><span>My role</span><strong>{project.role}</strong></div><div><span>The scope</span><strong>{project.scope}</strong></div></div>
          <p className="dialog-description">{project.description}</p>
          <h3 className="detail-heading">The work, in a little more detail</h3>
          <ul className="project-highlights">{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          <p className="visual-note">Cover: a custom project illustration, not a production screenshot.{project.gallery ? ' The presentation slides below are my original work from Notion.' : ''}</p>
          {project.sourceUrl && <a className="text-link project-source" href={project.sourceUrl} target="_blank" rel="noreferrer">View the original Notion portfolio ↗</a>}
          {project.gallery && <section className="project-evidence" aria-label="Original project presentation"><h3 className="detail-heading">From the original presentation</h3>{project.gallery.map((image, index) => <a href={image} key={image} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} presentation slide ${index + 1} at full size`}><img src={image} alt={`${project.title} — original presentation slide ${index + 1}`} loading="lazy" width="1600" height="900" /></a>)}</section>}
          <div className="dialog-bottom">
            <Pill href={`mailto:${profile.email}?subject=${encodeURIComponent(`Let’s talk about ${project.title}`)}`}>Let’s talk about this</Pill>
            <div className="project-pagination"><button className="icon-button previous" onClick={onPrevious} aria-label="Previous project"><Icon name="arrow" /></button><button className="icon-button" onClick={onNext} aria-label="Next project"><Icon name="arrow" /></button></div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
