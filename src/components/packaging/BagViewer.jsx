import { Component, Suspense, lazy, startTransition, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Move3d, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import '../../styles/bag-viewer.css';

const BagViewerScene = lazy(() => import('./BagViewerScene.jsx'));

const VIEW_BUTTONS = [
  ['front', 'Front'],
  ['back', 'Back'],
  ['left', 'Left'],
  ['right', 'Right'],
  ['top', 'Top'],
];
const STEP = Math.PI / 12;

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <p className="bv-message">The 3D view could not load on this device. Try a recent desktop or mobile browser.</p>;
    return this.props.children;
  }
}

const Loading = () => <div className="bv-loading" role="status"><span className="bv-spinner" aria-hidden="true" />Loading 3D viewer…</div>;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function BagViewer({ bags, label = 'Interactive 3D bag viewer' }) {
  const helpId = useId();
  const stageRef = useRef(null);
  const api = useRef(null);
  const [bagIndex, setBagIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [autoRotate, setAutoRotate] = useState(() => !prefersReducedMotion());
  const [view, setView] = useState('home');
  const [engaged, setEngaged] = useState(false);

  const bag = bags[bagIndex];
  const variant = bag.variants[Math.min(variantIndex, bag.variants.length - 1)];

  // Only create the WebGL context once the viewer is near the screen, and pause rendering when it scrolls away.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setMounted(true); setVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setMounted(true);
    }, { rootMargin: '300px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stopAuto = useCallback(() => { setAutoRotate(false); setView(null); }, []);

  const goTo = (name) => {
    setAutoRotate(false);
    setView(name);
    api.current?.view(name);
  };

  const chooseBag = (index) => {
    if (index === bagIndex) return;
    startTransition(() => {
      setBagIndex(index);
      // Keep the selected finish (grey / white) when the next grade has it.
      const current = bag.variants[variantIndex]?.id;
      const match = bags[index].variants.findIndex((item) => item.id === current);
      setVariantIndex(match >= 0 ? match : 0);
    });
  };

  const chooseVariant = (index) => startTransition(() => setVariantIndex(index));

  const onKeyDown = (event) => {
    const c = api.current;
    // Only when the stage itself has focus, not the Grey / White buttons inside it.
    if (!c || event.target !== event.currentTarget) return;
    const pan = event.shiftKey ? 0.15 : 0;
    const actions = {
      ArrowLeft: () => (pan ? c.pan(-pan, 0) : c.rotate(-STEP)),
      ArrowRight: () => (pan ? c.pan(pan, 0) : c.rotate(STEP)),
      ArrowUp: () => (pan ? c.pan(0, -pan) : c.rotate(0, -STEP)),
      ArrowDown: () => (pan ? c.pan(0, pan) : c.rotate(0, STEP)),
      '+': () => c.zoom(1),
      '=': () => c.zoom(1),
      '-': () => c.zoom(-1),
      _: () => c.zoom(-1),
      0: () => goTo('home'),
      Home: () => goTo('home'),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    if (event.key !== '0' && event.key !== 'Home') stopAuto();
    action();
  };

  return (
    <div className="bv" style={{ '--bv-accent': bag.colour }}>
      <div className="bv-picker" role="group" aria-label="Choose a bag">
        {bags.map((item, index) => (
          <button key={item.id} type="button" className="bv-chip" style={{ '--chip': item.colour }} aria-pressed={index === bagIndex} onClick={() => chooseBag(index)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="bv-frame">
        <div
          ref={stageRef}
          className="bv-stage"
          tabIndex={0}
          role="group"
          aria-roledescription="3D viewer"
          aria-label={`${label}: ${bag.name}${variant.label && bag.variants.length > 1 ? `, ${variant.label}` : ''}`}
          aria-describedby={helpId}
          onKeyDown={onKeyDown}
          onPointerDown={() => setEngaged(true)}
          onFocus={() => setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false); }}
          data-engaged={engaged || undefined}
        >
          {mounted && (
            <SceneBoundary>
              <Suspense fallback={<Loading />}>
                <BagViewerScene src={variant.src} apiRef={api} autoRotate={autoRotate} onInteract={stopAuto} active={visible} wheelZoom={engaged} />
              </Suspense>
            </SceneBoundary>
          )}

          <div className="bv-top">
            <p className="bv-name">{bag.name}</p>
            {bag.variants.length > 1 && (
              <div className="bv-variants" role="group" aria-label="Finish">
                {bag.variants.map((item, index) => (
                  <button key={item.id} type="button" className={`bv-variant is-${item.id}`} aria-pressed={item === variant} onClick={() => chooseVariant(index)}>{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bv-toolbar">
          <div className="bv-views" role="group" aria-label="Camera view">
            {VIEW_BUTTONS.map(([name, text]) => (
              <button key={name} type="button" aria-pressed={view === name} onClick={() => goTo(name)}>{text}</button>
            ))}
          </div>
          <div className="bv-tools" role="group" aria-label="Zoom and rotation">
            <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => { stopAuto(); api.current?.zoom(-1); }}><ZoomOut size={18} aria-hidden="true" /></button>
            <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => { stopAuto(); api.current?.zoom(1); }}><ZoomIn size={18} aria-hidden="true" /></button>
            <button type="button" aria-label="Auto-rotate" title={autoRotate ? 'Stop rotating' : 'Auto-rotate'} aria-pressed={autoRotate} onClick={() => { setView(null); setAutoRotate((value) => !value); }}>
              {autoRotate ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>
            <button type="button" aria-label="Reset view" title="Reset view" onClick={() => goTo('home')}><RotateCcw size={18} aria-hidden="true" /></button>
          </div>
        </div>
      </div>

      <p className="bv-help" id={helpId}>
        <Move3d size={16} aria-hidden="true" />
        <span className="bv-help-pointer">Drag to rotate · Click the bag, then scroll to zoom · Right-drag or Shift-drag to move.</span>
        <span className="bv-help-touch">Drag to rotate · Pinch to zoom · Two fingers to move.</span>
        <span className="bv-help-keys">Keyboard: arrows rotate, Shift + arrows move, + / − zoom, 0 resets.</span>
      </p>
    </div>
  );
}
