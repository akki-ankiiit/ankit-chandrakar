import { useLayoutEffect, useRef } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import ProjectOverview from '../components/ProjectOverview.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { adhikarMeta } from '../data/adhikar-meta.js';
import { applyPresentationBackground } from '../lib/presentationBackground.js';
import '../styles/contractorbhai.css';
import '../styles/adhikar-case-study.css';
import '../styles/cb-reading-page.css';

const returnState = { category: 'case-studies', focusProject: 'adhikar' };

function handlePresentationLoad(event) {
  applyPresentationBackground(event, '#fdfdf5');
}

export default function AdhikarCaseStudy() {
  const page = useRef(null);
  usePageMeta(adhikarMeta);

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
    <section ref={page} className="cb-page cb-reading-page adhikar-page" aria-label="Adhikar case study">
      <nav className="cb-backbar" aria-label="Case study navigation">
        <ProjectBackLink state={returnState} label="Back to Case Studies" />
      </nav>
      <ProjectOverview projectId="adhikar" />
      <section className="cb-reading-presentation" aria-labelledby="original-presentation-heading">
        <h2 id="original-presentation-heading">Explore the original presentation</h2>
        <div className="cb-reading-presentation__intro">
          <p>Browse slides, open the contents, or inspect the original screens.</p>
          <a href="/assets/Adhikar/Adhikaar-App-Presentation.html" target="_blank" rel="noopener noreferrer">Open standalone presentation ↗</a>
        </div>
        <iframe
          className="cb-presentation"
          src="/assets/Adhikar/Adhikaar-App-Presentation.html"
          title="Adhikar — interactive app presentation"
          onLoad={handlePresentationLoad}
          loading="lazy"
          allowFullScreen
        />
      </section>
    </section>
  );
}
