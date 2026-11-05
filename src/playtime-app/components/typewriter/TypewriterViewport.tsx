import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

interface TypewriterViewportProps {
  /** The one scroll region. The paper (and everything written on it) lives inside it. */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Fixed machine row. It sits outside the scroll region, so it never moves and never covers text. */
  carriage: ReactNode;
  onResize?: () => void;
  children: ReactNode;
}

const PREFERRED_MIN = 260;
const PREFERRED_MAX = 640;
const FLOOR = 120;

/** Safe-area bottom inset in CSS px (env() is not readable from script, so measure it through a probe). */
function measureSafeBottom(): number {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(probe);
  const inset = probe.offsetHeight;
  probe.remove();
  return inset;
}

/**
 * A contained writing area with a stable machine row above one scrolling sheet.
 * Its height follows the visual viewport, so an open mobile keyboard shrinks the writing area
 * instead of hiding the caret. The page itself does not move.
 */
export function TypewriterViewport({ scrollRef, carriage, onResize, children }: TypewriterViewportProps) {
  const view = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(440);
  const [gutter, setGutter] = useState(0);
  const latestResize = useRef(onResize);
  useLayoutEffect(() => { latestResize.current = onResize; });

  // Scrollbar width: the machine row gets the same padding, so its width matches the sheet exactly.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return undefined;
    const measure = () => setGutter(Math.max(0, scroll.offsetWidth - scroll.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroll);
    return () => observer.disconnect();
  }, [scrollRef]);

  useLayoutEffect(() => {
    const el = view.current;
    if (!el) return undefined;
    const safeBottom = measureSafeBottom();
    const fit = () => {
      const vv = window.visualViewport;
      const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const preferred = Math.min(PREFERRED_MAX, Math.max(PREFERRED_MIN, window.innerHeight * 0.62));
      // Only an open keyboard (visual viewport clearly shorter than the layout viewport) shrinks the area.
      const keyboardOpen = vv ? vv.height < window.innerHeight * 0.8 : false;
      let next = preferred;
      if (keyboardOpen) {
        const available = visibleBottom - el.getBoundingClientRect().top - safeBottom - 12;
        next = Math.min(preferred, Math.max(FLOOR, available));
      }
      setHeight(Math.round(next));
      // Wait a frame so the scroll region has its new height before the caret is followed.
      requestAnimationFrame(() => latestResize.current?.());
    };
    fit();
    const vv = window.visualViewport;
    window.addEventListener('resize', fit);
    vv?.addEventListener('resize', fit);
    vv?.addEventListener('scroll', fit);
    return () => {
      window.removeEventListener('resize', fit);
      vv?.removeEventListener('resize', fit);
      vv?.removeEventListener('scroll', fit);
    };
  }, []);

  return (
    <div ref={view} className="tw-viewport" style={{ height }}>
      <div className="tw-carriage-row" style={{ paddingRight: gutter }}>{carriage}</div>
      <div ref={scrollRef} className="tw-scroll" data-tw-scroll data-lenis-prevent>
        {children}
        <div className="tw-scroll-end" aria-hidden="true" />
      </div>
    </div>
  );
}
