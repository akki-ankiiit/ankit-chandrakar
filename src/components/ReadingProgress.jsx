import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Page-scroll progress bar that sits on the bottom edge of the navbar (and rides to the top of the screen
// while the navbar is tucked away). The fill is written straight to its transform, so scrolling never re-renders React.
export default function ReadingProgress({ active, headerHidden }) {
  const fill = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!active) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!fill.current) return;
      const root = document.documentElement;
      const scrollable = root.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
      fill.current.style.transform = `scaleX(${value})`;
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    // Pages grow as lazy images and chapters load, so re-measure when the document height changes.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(request) : null;
    observer?.observe(document.body);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      observer?.disconnect();
    };
  }, [active, pathname]);

  if (!active) return null;
  return <div className={`reading-progress${headerHidden ? ' is-header-hidden' : ''}`} role="progressbar" aria-label="Reading progress" aria-hidden="true"><div ref={fill} className="reading-progress-fill" /></div>;
}
