import { useEffect, useRef, useState } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import ProjectOverview from '../components/ProjectOverview.jsx';
import { projectMetas } from '../data/project-meta.js';
import '../styles/figma-file.css';

export default function FigmaFilePage({ project }) {
  const pageRef = useRef(null);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const [viewerActive, setViewerActive] = useState(false);

  usePageMeta(projectMetas[project.id] || {
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
    <section className="figma-file-page" ref={pageRef} aria-label={`${project.title} project overview and design file`}>
      <div className="project-header-rail"><ProjectBackLink state={{ category: project.id === 'neostra-cpmp' ? 'design-systems' : 'case-studies', focusProject: project.id }} label="Back to selected work" /></div>
      <ProjectOverview projectId={project.id} />
      <header className="figma-file-toolbar">
        <div className="figma-file-heading">
          <h2 id="figma-file-title">Inspect the original design file</h2>
          <p>The external viewer may require Figma access. The overview remains available above.</p>
        </div>
        <div className="figma-file-actions">
          <a href={project.fileUrl} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>
          {fullscreenAvailable && viewerActive && <button type="button" onClick={toggleFullscreen} aria-pressed={isFullscreen}>
            {isFullscreen ? 'Exit fullscreen' : 'Expand viewer'}
          </button>}
          {fullscreenError && <p className="figma-file-error" role="status">{fullscreenError}</p>}
        </div>
      </header>
      <div className={`figma-file-viewer${viewerActive ? '' : ' is-inactive'}`}>
        {viewerActive ? <iframe
          src={project.embedUrl}
          title={`${project.title} — ${project.embedLabel}`}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        /> : <div className="figma-file-facade"><p>Load the interactive file when you’re ready to inspect the screens.</p><button type="button" className="pill" onClick={() => setViewerActive(true)}>Load Figma preview</button><a href={project.fileUrl} target="_blank" rel="noopener noreferrer">Open the design file in a new tab ↗</a></div>}
      </div>
    </section>
  );
}
