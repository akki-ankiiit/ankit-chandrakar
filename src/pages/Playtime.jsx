import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import playtimeStyles from '../styles/playtime-app.css?inline';
import HeroArtwork from '../components/HeroArtwork.jsx';
import { Pill, SocialLinks } from '../components/ui.jsx';

const propertyRules = playtimeStyles.match(/@property[^{]+\{[^}]*\}/g) || [];
const PlaytimeApp = lazy(() => import('../playtime-app/PlaytimeApp.tsx'));

function scrollToTarget(target) {
  if (window.__playtimeLenis) window.__playtimeLenis.scrollTo(target.getBoundingClientRect().top + window.scrollY, { offset: 0, duration: 1.2 });
  else target.scrollIntoView({ block: 'start' });
}

export default function Playtime() {
  const hostRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    let style = shadow.querySelector('style[data-playtime]');
    if (!style) {
      style = document.createElement('style');
      style.dataset.playtime = '';
      shadow.appendChild(style);
    }
    if (style.textContent !== playtimeStyles) style.textContent = playtimeStyles;

    let propertiesStyle = document.getElementById('playtime-properties');
    if (!propertiesStyle) {
      propertiesStyle = document.createElement('style');
      propertiesStyle.id = 'playtime-properties';
      propertiesStyle.textContent = propertyRules.join('\n');
      document.head.appendChild(propertiesStyle);
    }
    let container = shadow.querySelector('[data-playtime-root]');
    if (!container) {
      container = document.createElement('div');
      container.dataset.playtimeRoot = '';
      shadow.appendChild(container);
    }
    setMountNode(container);
    // React owns the portal children; the host owns this stable destination.
    // Keep global property registrations for subsequent route entries, too.
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const shadow = host?.shadowRoot;
    if (!shadow) return;

    const onAnchorClick = (event) => {
      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = shadow.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      window.history.replaceState(window.history.state, '', hash);
    };

    shadow.addEventListener('click', onAnchorClick);
    const hadRouteClass = document.documentElement.classList.contains('playtime-route');
    document.documentElement.classList.add('playtime-route');

    return () => {
      shadow.removeEventListener('click', onAnchorClick);
      if (!hadRouteClass) document.documentElement.classList.remove('playtime-route');
    };
  }, []);

  return (
    <>
      <section className="hero hero-compact hero-hub" aria-labelledby="playtime-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow"><span /> PLAYTIME · INTERACTIVE EXPERIMENTS</p>
            <h1 id="playtime-title">I code for fun, here you can experience.</h1>
            <p className="hero-introduction">A place to make things move, test ideas, and enjoy the process.</p>
            <div className="hero-socials">
              <Pill onClick={() => {
                const target = hostRef.current?.shadowRoot?.querySelector('#pocket-vibes') || hostRef.current;
                if (target) scrollToTarget(target);
              }}>Start playing</Pill>
              <SocialLinks />
            </div>
          </div>
          <div className="hero-art">
            <HeroArtwork videoSrc="/assets/skating-desk-paper.mp4" />
          </div>
        </div>
      </section>

      <div ref={hostRef} className="playtime-shadow-host">
        {mountNode ? createPortal(
          <Suspense fallback={<div className="playtime-experiments-loading" aria-label="Loading experiments" />}>
            <PlaytimeApp />
          </Suspense>,
          mountNode,
        ) : null}
      </div>
    </>
  );
}
