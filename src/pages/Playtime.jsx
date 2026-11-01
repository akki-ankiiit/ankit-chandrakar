import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PlaytimeApp from '../playtime-app/PlaytimeApp.tsx';
import playtimeStyles from '../styles/playtime-app.css?inline';
import HeroArtwork from '../components/HeroArtwork.jsx';
import { Pill, SocialLinks } from '../components/ui.jsx';

const propertyRules = playtimeStyles.match(/@property[^{]+\{[^}]*\}/g) || [];

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
    style.textContent = playtimeStyles;

    let propertiesStyle = document.getElementById('playtime-properties');
    if (!propertiesStyle) {
      propertiesStyle = document.createElement('style');
      propertiesStyle.id = 'playtime-properties';
      document.head.appendChild(propertiesStyle);
    }
    propertiesStyle.textContent = propertyRules.join('\n');

    const container = document.createElement('div');
    shadow.appendChild(container);
    setMountNode(container);

    return () => {
      container.remove();
      propertiesStyle.remove();
      setMountNode(null);
    };
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
      window.history.replaceState(null, '', hash);
    };

    shadow.addEventListener('click', onAnchorClick);
    document.documentElement.classList.add('playtime-route');

    return () => {
      shadow.removeEventListener('click', onAnchorClick);
      document.documentElement.classList.remove('playtime-route');
    };
  }, []);

  const scrollToTarget = (target) => {
    if (window.__playtimeLenis) window.__playtimeLenis.scrollTo(target, { offset: 0, duration: 1.2 });
    else target.scrollIntoView({ block: 'start' });
  };

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
                const target = hostRef.current?.shadowRoot?.querySelector('#pocket-vibes');
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
        {mountNode ? createPortal(<PlaytimeApp />, mountNode) : null}
      </div>
    </>
  );
}
