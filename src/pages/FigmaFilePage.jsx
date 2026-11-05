import { useEffect, useRef, useState } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import '../styles/figma-file.css';

export default function FigmaFilePage({ project }) {
  const pageRef = useRef(null);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');

  usePageMeta({
    title: `${project.title} — Ankit Chandrakar`,
    description: project.description,
    image: project.image,
    imageAlt: `${project.title} — design system`,
    path: `/work/${project.id}`,
  });

  useEffect(() => {
    const page = pageRef.current;
    setFullscreenAvailable(Boolean(document.fullscreenEnabled && page?.requestFullscreen));
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === page);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    setFullscreenError('');
    try {
      if (document.fullscreenElement === pageRef.current) await document.exitFullscreen();
      else await pageRef.current.requestFullscreen();
    } catch {
      setFullscreenError('Fullscreen could not be changed. Please try again.');
    }
  };

  return (
    <section className="figma-file-page" ref={pageRef} aria-labelledby="figma-file-title">
      <ProjectBackLink state={{ category: 'design-systems', focusProject: project.id }} label="Back to Design Systems" />
      <header className="figma-file-toolbar">
        <div className="figma-file-heading">
          <h1 id="figma-file-title" className="sr-only">{project.title}</h1>
          <p>{project.embedLabel}</p>
        </div>
        <div className="figma-file-actions">
          <a href={project.fileUrl} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>
          {fullscreenAvailable && <button type="button" onClick={toggleFullscreen} aria-pressed={isFullscreen}>
            {isFullscreen ? 'Exit fullscreen' : 'Expand viewer'}
          </button>}
          {fullscreenError && <p className="figma-file-error" role="status">{fullscreenError}</p>}
        </div>
      </header>
      <div className="figma-file-viewer">
        <iframe
          src={project.embedUrl}
          title={`${project.title} — ${project.embedLabel}`}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="eager"
        />
      </div>
    </section>
  );
}
