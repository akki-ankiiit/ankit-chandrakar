import { useEffect, useRef, useState } from 'react';

// Becomes true once the element is near the viewport and stays true, so media mounts once and is not torn down on scroll.
export default function useInView(rootMargin = '200px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return undefined;
    const node = ref.current;
    if (!node) return undefined;
    if (typeof window.IntersectionObserver !== 'function') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
