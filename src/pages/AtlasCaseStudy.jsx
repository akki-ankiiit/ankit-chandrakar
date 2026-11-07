import { useLayoutEffect, useRef, useState } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import ProjectOverview from '../components/ProjectOverview.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { atlasMeta } from '../data/atlas-meta.js';
import { applyPresentationBackground } from '../lib/presentationBackground.js';
import '../styles/contractorbhai.css';
import '../styles/cb-reading-page.css';

const returnState = { category: 'case-studies', focusProject: 'atlas' };

function handlePresentationLoad(event) {
  applyPresentationBackground(event, '#fdfdf5');
}

export default function AtlasCaseStudy() {
  const page = useRef(null);
  const [presentationOpen, setPresentationOpen] = useState(false);
  usePageMeta(atlasMeta);

  useLayoutEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const updateHeight = () => {
      page.current?.style.setProperty('--cb-header-height', `${header.getBoundingClientRect().height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={page} className="cb-page cb-reading-page" aria-label="Atlas case study">
      <nav className="cb-backbar" aria-label="Case study navigation">
        <ProjectBackLink state={returnState} label="Back to Case Studies" />
      </nav>
      <ProjectOverview projectId="atlas" />
      <details className="cb-reading-presentation" onToggle={(event) => setPresentationOpen(event.currentTarget.open)}>
        <summary>Explore the original presentation</summary>
        <div className="cb-reading-presentation__intro">
          <p>Browse slides, open the contents, or inspect the original screens.</p>
          <a href="/assets/Atlas/Atlas-Case-Study.html" target="_blank" rel="noopener noreferrer">Open standalone presentation ↗</a>
        </div>
        {presentationOpen && <iframe
          className="cb-presentation"
          src="/assets/Atlas/Atlas-Case-Study.html"
          title="Atlas — interactive case study"
          onLoad={handlePresentationLoad}
          loading="lazy"
          allowFullScreen
        />}
      </details>
    </section>
  );
}
