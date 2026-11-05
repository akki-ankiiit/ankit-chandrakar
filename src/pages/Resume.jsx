import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/resume.css';
import { Pill } from '../components/ui.jsx';
import { profile } from '../data/portfolio.js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Renders every PDF page onto a canvas so the sheets sit on the page with no browser viewer chrome.
function ResumeSheets({ src }) {
  const hostRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const update = () => setWidth(Math.round(host.clientWidth / 40) * 40);
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
        host.replaceChildren();
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
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [src, width]);

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

  useEffect(() => {
    document.title = 'My Resume — Ankit Chandrakar';
  }, []);

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
        <ResumeSheets src={profile.resume} />
      </div>
    </section>
  );
}
