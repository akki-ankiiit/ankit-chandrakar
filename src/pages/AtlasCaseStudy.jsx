import { useLayoutEffect, useRef } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { atlasMeta } from '../data/atlas-meta.js';
import '../styles/contractorbhai.css';

const returnState = { category: 'case-studies', focusProject: 'atlas' };

export default function AtlasCaseStudy() {
  const page = useRef(null);
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
    <section ref={page} className="cb-page" aria-label="Atlas case study">
      <nav className="cb-backbar" aria-label="Case study navigation">
        <ProjectBackLink state={returnState} label="Back to Case Studies" />
      </nav>
      <iframe
        className="cb-presentation"
        src="/assets/Atlas/Atlas-Case-Study.html"
        title="Atlas — interactive case study"
        allowFullScreen
      />
    </section>
  );
}
