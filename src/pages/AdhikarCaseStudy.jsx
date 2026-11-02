import { useLayoutEffect, useRef } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { adhikarMeta } from '../data/adhikar-meta.js';
import '../styles/contractorbhai.css';
import '../styles/adhikar-case-study.css';

const returnState = { category: 'case-studies', focusProject: 'adhikar' };

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
    <section ref={page} className="cb-page adhikar-page" aria-label="Adhikaar case study">
      <nav className="cb-backbar" aria-label="Case study navigation">
        <ProjectBackLink state={returnState} label="Back to Case Studies" />
      </nav>
      <iframe
        className="cb-presentation"
        src="/assets/Adhikar/Adhikaar-App-Presentation.html"
        title="Adhikaar — interactive app presentation"
        allowFullScreen
      />
    </section>
  );
}
