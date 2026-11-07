import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/resume.css';
import { Pill } from '../components/ui.jsx';
import { profile } from '../data/portfolio.js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import usePageMeta from '../hooks/usePageMeta.js';

// Renders every PDF page onto a canvas so the sheets sit on the page with no browser viewer chrome.
function ResumeSheets({ src, onText }) {
  const hostRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const update = () => setWidth(Math.floor(host.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !width) return undefined;
    let cancelled = false;
    let loadingTask;
    let doc;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        loadingTask = pdfjs.getDocument(src);
        doc = await loadingTask.promise;
        if (cancelled) return;
        host.replaceChildren();
        const transcript = [];
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let number = 1; number <= doc.numPages; number += 1) {
          const page = await doc.getPage(number);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const scale = (width / base.width) * dpr;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${width}px`;
          canvas.style.height = `${(width * base.height) / base.width}px`;
          canvas.className = 'resume-sheet';
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `Résumé page ${number} of ${doc.numPages}`);
          host.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          const content = await page.getTextContent();
          transcript.push(content.items.map((item) => item.str + (item.hasEOL ? '\n' : ' ')).join(''));
        }
        if (!cancelled) onText(transcript.join('\n\n'));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [src, width, onText]);

  return (
    <div className="resume-sheets" ref={hostRef}>
      {failed && (
        <p className="resume-fallback">
          The preview couldn’t load. <a href={src} download>Download the résumé</a> instead.
        </p>
      )}
    </div>
  );
}

export default function Resume() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  usePageMeta({ title: 'Résumé — Ankit Chandrakar · Product Designer', description: 'View or download Ankit Chandrakar’s résumé: product design across enterprise privacy, SaaS, design systems, and AI-assisted prototypes.', image: '/assets/social-preview.jpg', path: '/resume', siteUrl: profile.website });

  return (
    <section className="resume-page page-enter" aria-labelledby="resume-title">
      <div className="container resume-inner">
        <header className="resume-header">
          <div className="resume-heading">
            <p className="eyebrow">Curriculum vitae</p>
            <h1 id="resume-title">My Resume</h1>
          </div>
          <div className="resume-actions">
            <Pill className="resume-primary" href={profile.resume} download>Download</Pill>
            <Pill className="resume-secondary" onClick={() => navigate('/')}>Go to home</Pill>
          </div>
        </header>
        <p className="resume-reading-note">Download the original document or <a href={profile.resume} target="_blank" rel="noopener noreferrer">open the selectable PDF in a new tab ↗</a>.</p>
        <ResumeSheets src={profile.resume} onText={setResumeText} />
        {resumeText && <details className="resume-transcript"><summary>Read résumé as text</summary><div>{resumeText}</div></details>}
      </div>
    </section>
  );
}
