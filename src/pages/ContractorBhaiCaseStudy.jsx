import { useLayoutEffect, useRef } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { contractorBhaiMeta } from '../data/contractorbhai-meta.js';
import '../styles/contractorbhai.css';

const returnState = { category: 'case-studies', focusProject: 'contractorbhai' };

function applyPresentationBranding(event) {
  // Brand the same-origin iframe at runtime to preserve the original presentation source.
  const document = event.currentTarget.contentDocument;
  if (!document) return;

  if (!document.getElementById('cb-presentation-branding')) {
    const style = document.createElement('style');
    style.id = 'cb-presentation-branding';
    style.textContent = `
      .top .brand img { display: block; width: 188px; height: 44px; object-fit: contain; }
      .slide:not(.dark) .top .brand img { filter: brightness(0); }
    `;
    document.head.append(style);
  }

  document.querySelectorAll('.top .brand').forEach((brand) => {
    const logo = document.createElement('img');
    logo.src = '/assets/ContractorBhai/logo.svg';
    logo.alt = 'Contractor भाई';
    logo.width = 188;
    logo.height = 44;
    brand.replaceChildren(logo);
  });
}

export default function ContractorBhaiCaseStudy() {
  const page = useRef(null);
  usePageMeta(contractorBhaiMeta);

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
    <section ref={page} className="cb-page" aria-label="ContractorBhai product design case study">
      <nav className="cb-backbar" aria-label="Case study navigation">
        <ProjectBackLink state={returnState} label="Back to Case Studies" />
      </nav>
      <iframe
        className="cb-presentation"
        src="/assets/ContractorBhai/Final.html"
        title="ContractorBhai — interactive product design case study"
        onLoad={applyPresentationBranding}
        allowFullScreen
      />
    </section>
  );
}
