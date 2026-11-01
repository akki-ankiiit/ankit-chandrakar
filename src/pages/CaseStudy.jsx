import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { profile, projects } from '../data/portfolio.js';
import { Pill } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';
import '../styles/case-study-route.css';

function Presentation({ project }) {
  const chapters = project.caseStudy.chapters;
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  const current = chapters[active];
  const onTabKeyDown = (event, index) => {
    const next = { ArrowRight: (index + 1) % chapters.length, ArrowLeft: (index + chapters.length - 1) % chapters.length, Home: 0, End: chapters.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };
  return (
    <section id="presentation" className="case-presentation" aria-labelledby="presentation-title">
      <div className="case-section-heading"><span className="chapter-number">04</span><div><p className="eyebrow">The work, as published</p><h2 id="presentation-title">Inside the presentation.</h2></div></div>
      <p className="case-section-intro">Original project visuals from {project.sourceLabel || 'my portfolio'}, grouped into chapters. Select a chapter to explore, or open any image at full size.</p>
      <div className="presentation-tabs" role="tablist" aria-label="Presentation chapters">
        {chapters.map((chapter, index) => <button key={chapter.id} ref={(element) => { tabRefs.current[index] = element; }} role="tab" id={`chapter-${chapter.id}`} aria-selected={active === index} aria-controls="presentation-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => onTabKeyDown(event, index)}><span>{String(index + 1).padStart(2, '0')}</span>{chapter.title}</button>)}
      </div>
      <div className="presentation-panel" id="presentation-panel" role="tabpanel" aria-labelledby={`chapter-${current.id}`} key={current.id}>
        <div className="presentation-caption"><p>{current.description}</p><span>{current.images.length} {current.images.length === 1 ? 'image' : 'images'}</span></div>
        <div className="presentation-images">
          {current.images.map((image, index) => <figure key={image.src}><a href={image.src} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}: ${current.title}, image ${index + 1} at full size`}><img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" /></a><figcaption><span>{current.title} / {String(index + 1).padStart(2, '0')}</span><span>Original work <Icon name="expand" size={12} /></span></figcaption></figure>)}
        </div>
      </div>
    </section>
  );
}

function CaseStudyContent({ project }) {
  const [progress, setProgress] = useState(0);
  const article = useRef(null);
  const hasPresentation = project.caseStudy.chapters.length > 0;
  const index = projects.findIndex((item) => item.id === project.id);
  const next = projects[(index + 1) % projects.length];

  useEffect(() => {
    document.title = `${project.title} — Case study by Ankit Chandrakar`;
    const description = document.querySelector('meta[name="description"]');
    const previous = description?.content;
    if (description) description.content = project.description;
    const update = () => {
      if (!article.current) return;
      const rect = article.current.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight))));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); if (description && previous) description.content = previous; };
  }, [project]);

  const contributionNumber = project.embedUrl ? '05' : '04';
  const contents = [{ id: 'overview', label: 'Overview' }, { id: 'challenge', label: 'The challenge' }, { id: 'approach', label: 'The approach' }, ...(project.embedUrl ? [{ id: 'live', label: 'The live site' }] : []), ...(hasPresentation ? [{ id: 'presentation', label: 'Presentation' }] : [{ id: 'contribution', label: 'Design scope' }])];

  return (
    <article className="case-study-page page-enter" ref={article}>
      <div className="case-reading-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <header className="case-hero case-container">
        <div className="case-breadcrumb"><Link to="/#work" state={{ category: project.group, focusProject: project.id }}><Icon name="arrow" size={15} />Back to selected work</Link><span>PROJECT {String(index + 1).padStart(2, '0')} / {project.category.toUpperCase()}</span></div>
        <div className="case-title-row"><div><p className="eyebrow">{project.caseStudy.eyebrow || 'From the design scrapbook'}</p><h1>{project.title}</h1><p className="case-subtitle">{project.subtitle}</p></div><div className="case-stamp"><Icon size={24} /><span>thoughtfully<br />put together.</span></div></div>
        <dl className="case-facts"><div><dt>My role</dt><dd>{project.role}</dd></div><div><dt>Scope</dt><dd>{project.scope}</dd></div><div><dt>Year</dt><dd>{project.year}</dd></div><div><dt>{project.sourceLabel ? 'Original publication' : 'Organization'}</dt><dd>{project.sourceLabel ? <a href={project.sourceUrl} target="_blank" rel="noreferrer">View on {project.sourceLabel} ↗</a> : project.client}</dd></div></dl>
        <figure className="case-cover"><img src={project.image} alt={`${project.title} — scrapbook cover illustration`} width="1200" height="850" fetchPriority="high" /><figcaption><span>From sketches to considered experiences.</span><span>Illustrated project cover</span></figcaption></figure>
      </header>

      <div className="case-body case-container">
        <aside className="case-contents"><p>IN THIS CHAPTER</p><nav aria-label="Case study contents">{contents.map((item, number) => <Link to={`#${item.id}`} key={item.id}><span>0{number + 1}</span>{item.label}</Link>)}</nav><div className="case-margin-note">Good design starts<br />with good questions.<svg viewBox="0 0 80 50" aria-hidden="true"><path d="M5 5c45-8 65 12 37 35m-7-13 7 13 17-7" /></svg></div></aside>
        <div className="case-story">
          <section id="overview" className="case-section"><div className="case-section-heading"><span className="chapter-number">01</span><div><p className="eyebrow">The short story</p><h2>A little context.</h2></div></div><p className="case-lead">{project.description}</p><div className="case-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section>
          <section id="challenge" className="case-section"><div className="case-section-heading"><span className="chapter-number">02</span><div><p className="eyebrow">Start with the right question</p><h2>{hasPresentation ? 'What needed untangling?' : 'The product context.'}</h2></div></div><div className="challenge-note"><span className="paper-tape" aria-hidden="true" /><p>{project.caseStudy.challenge}</p></div></section>
          <section id="approach" className="case-section"><div className="case-section-heading"><span className="chapter-number">03</span><div><p className="eyebrow">From the question to the details</p><h2>A considered approach.</h2></div></div><div className="case-approach">{project.caseStudy.approach.map((step, number) => <div key={step.title}><span className="approach-number">0{number + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>
          {project.embedUrl && <section id="live" className="case-section"><div className="case-section-heading"><span className="chapter-number">04</span><div><p className="eyebrow">Visit the site</p><h2>The live site.</h2></div></div><div className="project-embed"><iframe src={project.embedUrl} title={`${project.title} — live website`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><a className="text-link" href={project.embedUrl} target="_blank" rel="noreferrer">Open the site in a new tab ↗</a></div></section>}
          {hasPresentation ? <Presentation project={project} /> : <section id="contribution" className="case-section"><div className="case-section-heading"><span className="chapter-number">{contributionNumber}</span><div><p className="eyebrow">An overview of the work</p><h2>What I contributed.</h2></div></div><ul className="case-contributions">{project.highlights.map((item) => <li key={item}><Icon size={14} /><span>{item}</span></li>)}</ul><p className="case-source-note">This project overview is based on my résumé and portfolio. The cover is an original scrapbook illustration; product screens can be added to this page as the case study grows.</p></section>}
          {project.caseStudy.takeaway && <section className="case-takeaway"><Icon size={24} /><h2>The thread that connects it.</h2><p>{project.caseStudy.takeaway}</p></section>}
          <div className="case-endnote"><span>Thanks for looking through my notes.</span>{project.sourceUrl && <a className="text-link" href={project.sourceUrl} target="_blank" rel="noreferrer">See the original on {project.sourceLabel} ↗</a>}{project.published && <small>Originally published {project.published}</small>}</div>
        </div>
      </div>
      <section className="case-next case-container"><div><p className="eyebrow">There’s another story in the folder</p><Link to={`/work/${next.id}`}><h2>{next.title}</h2><Icon name="arrow" size={30} /></Link><p>{next.subtitle}</p></div><Link to={`/work/${next.id}`} tabIndex={-1} aria-hidden="true"><img src={next.image} alt="" width="1200" height="850" loading="lazy" /></Link></section>
      <div className="case-contact-note"><p>Working through something similar?</p><Pill href={`mailto:${profile.email}?subject=${encodeURIComponent(`Let’s talk about ${project.title}`)}`}>Let’s compare notes</Pill></div>
    </article>
  );
}

function ShowcasePage({ project }) {
  useEffect(() => {
    document.title = `${project.title} — Ankit Chandrakar`;
  }, [project]);

  return (
    <article className="showcase-page page-enter">
      <div className="case-container">
        <Link className="showcase-back" to="/#work" state={{ category: project.group, focusProject: project.id }}><Icon name="arrow" size={15} />Back to selected work</Link>
        <header className="showcase-header">
          <h1>{project.title}</h1>
          <p className="case-subtitle">{project.subtitle}</p>
        </header>
        {project.context?.length > 0 && <div className="showcase-context">
          {project.context.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>}
      </div>
      <section className="showcase-site" aria-label={`${project.title} — ${project.embedLabel || 'live website'}`}>
        <div className="showcase-frame">
          {project.embedPreview ? <a className="showcase-preview" href={project.embedUrl} target="_blank" rel="noopener noreferrer">
            <img src={project.embedPreview.src} alt={project.embedPreview.alt} width={project.embedPreview.width} height={project.embedPreview.height} decoding="async" />
            <span className="showcase-preview-caption"><strong>{project.embedLinkLabel || 'Open the site in a new tab ↗'}</strong>{project.embedPreview.note && <small>{project.embedPreview.note}</small>}</span>
          </a> : <iframe src={project.embedUrl} title={`${project.title} — ${project.embedLabel || 'live website'}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
        </div>
        <a className="text-link" href={project.embedUrl} target="_blank" rel="noreferrer">{project.embedLinkLabel || 'Open the site in a new tab ↗'}</a>
      </section>
    </article>
  );
}

function StreamPage({ project }) {
  const images = project.caseStudy.chapters.flatMap((chapter) => chapter.images);
  useEffect(() => {
    document.title = `${project.title} — Case study by Ankit Chandrakar`;
  }, [project]);

  return (
    <article className="stream-page page-enter">
      <div className="case-container">
        <Link className="showcase-back" to="/#work" state={{ category: project.group, focusProject: project.id }}><Icon name="arrow" size={15} />Back to selected work</Link>
        <header className="showcase-header">
          <h1>{project.title}</h1>
          <p className="case-subtitle">{project.subtitle}</p>
        </header>
        <dl className="stream-facts"><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Scope</dt><dd>{project.scope}</dd></div><div><dt>Year</dt><dd>{project.year}</dd></div><div><dt>Client</dt><dd>{project.client}</dd></div></dl>
        <figure className="showcase-cover"><img src={project.image} alt={`${project.title} — case study cover`} width="1032" height="740" fetchPriority="high" /></figure>
        <p className="stream-intro">{project.description}</p>
        <div className="stream-images">
          {images.map((image) => <img key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />)}
        </div>
        {project.sourceUrl && <a className="text-link stream-source" href={project.sourceUrl} target="_blank" rel="noreferrer">View the original on {project.sourceLabel} ↗</a>}
      </div>
    </article>
  );
}

export default function CaseStudy() {
  const { projectId } = useParams();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return <NotFound title="This project isn’t in the folder." message="The case study you’re looking for may have moved, or it hasn’t been published yet. Browse the selected work to find your way back." />;
  if (project.stream) return <StreamPage key={project.id} project={project} />;
  if (project.embedUrl) return <ShowcasePage key={project.id} project={project} />;
  return <CaseStudyContent key={project.id} project={project} />;
}
