import { Link } from 'react-router-dom';
import { projectOverviews } from '../data/project-overviews.js';
import '../styles/project-overview.css';

function ProjectFigure({ figure }) {
  return (
    <figure className="project-overview__figure">
      <a href={figure.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size image: ${figure.alt}`}>
        <img
          src={figure.src}
          srcSet={figure.srcSet}
          sizes={figure.srcSet ? '(min-width: 1100px) 960px, 100vw' : undefined}
          width={figure.width}
          height={figure.height}
          alt={figure.alt}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption>{figure.caption} <a href={figure.src} target="_blank" rel="noopener noreferrer">View full size<span className="sr-only">: {figure.alt} (new tab)</span> ↗</a></figcaption>
    </figure>
  );
}

// children is an optional slot for a guided walkthrough or other project-specific evidence.
// The host page supplies its own back link, page spacing, and optional original presentation.
export default function ProjectOverview({ projectId, children }) {
  const project = projectOverviews[projectId];
  if (!project) return null;

  const headingId = `${projectId}-overview-title`;
  return (
    <section className="project-overview" aria-labelledby={headingId}>
      <header className="project-overview__header">
        <p className="project-overview__domain">{project.domain}</p>
        <h1 id={headingId}>{project.title}</h1>
        <p className="project-overview__summary">{project.description}</p>
        {project.facts?.length > 0 && (
          <dl className="project-overview__facts">
            {project.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>
        )}
      </header>

      <div className="project-overview__story">
        {project.sections.map((section) => (
          <section className="project-overview__section" key={section.id} aria-labelledby={`${projectId}-${section.id}`}>
            <div className="project-overview__copy">
              <h2 id={`${projectId}-${section.id}`}>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.figures?.length > 0 && (
              <div className={`project-overview__figures${section.figures.length > 1 ? ' project-overview__figures--paired' : ''}`}>
                {section.figures.map((figure) => <ProjectFigure key={figure.src} figure={figure} />)}
              </div>
            )}
          </section>
        ))}
      </div>

      {children}

      {project.links?.length > 0 && (
        <nav className="project-overview__links" aria-label={`${project.title} related work and source files`}>
          <h2>Explore further</h2>
          <ul>
            {project.links.map((link) => (
              <li key={link.href}>
                {link.href.startsWith('/') ? <Link to={link.href}>{link.label} <span aria-hidden="true">→</span></Link> : <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="sr-only"> (new tab)</span></a>}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
