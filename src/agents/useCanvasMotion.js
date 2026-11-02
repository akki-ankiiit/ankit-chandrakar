import { useEffect, useRef, useState } from 'react';
import { useAnimSlot } from './animSlots.js';

export function useCanvasMotion(want = true, priority = false) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(query.matches);
    const onVisibility = () => setVisible(!document.hidden);
    query.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      query.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  const animate = useAnimSlot(want && inView && visible && !reduced, priority);
  return { ref, animate };
}
