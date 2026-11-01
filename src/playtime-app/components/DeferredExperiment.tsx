import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

export function DeferredExperiment({ id, label, height = '100vh', background, children }: {
  id: string;
  label: string;
  height?: string;
  background?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMounted(true);
        observer.disconnect();
      }
    }, { rootMargin: '400px 0px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const placeholder = <div aria-hidden="true" style={{ height }} />;
  return (
    <div id={id} ref={ref} data-experiment-mounted={mounted} style={{ minHeight: height, background, position: 'relative' }}>
      <h2 className="playtime-experiment-entry">
        <a href={`#${id}`} onFocus={() => setMounted(true)} onClick={() => setMounted(true)}>Explore {label}</a>
      </h2>
      {mounted ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </div>
  );
}
