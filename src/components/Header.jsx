import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { imagery, profile } from '../data/portfolio.js';
import { Pill, Selection, SocialLinks } from './ui.jsx';
import ReadingProgress from './ReadingProgress.jsx';

export default function Header({ page, onNavigate }) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const previousScroll = useRef(0);
  const menuButton = useRef(null);
  const mobileNav = useRef(null);
  const header = useRef(null);
  const desktopMore = useRef(null);
  const mobileMore = useRef(null);

  useLayoutEffect(() => {
    const element = header.current;
    if (!element) return;
    const root = document.documentElement;
    const property = '--site-header-height';
    const previousValue = root.style.getPropertyValue(property);
    const previousPriority = root.style.getPropertyPriority(property);
    let publishedValue;
    const updateHeight = () => {
      publishedValue = `${element.offsetHeight}px`;
      root.style.setProperty(property, publishedValue);
    };
    updateHeight();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHeight) : null;
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      if (root.style.getPropertyValue(property) !== publishedValue || root.style.getPropertyPriority(property)) return;
      if (previousValue) root.style.setProperty(property, previousValue, previousPriority);
      else root.style.removeProperty(property);
    };
  }, []);

  useEffect(() => {
    const closeMore = (event) => {
      if (!desktopMore.current?.contains(event.target)) desktopMore.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', closeMore);
    return () => document.removeEventListener('pointerdown', closeMore);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const current = Math.max(0, window.scrollY);
      if (Math.abs(current - previousScroll.current) > 6) {
        setHidden(current > previousScroll.current && current > 170);
        previousScroll.current = current;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => mobileNav.current?.querySelector('a')?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const links = [...mobileNav.current.querySelectorAll('a, summary')].filter((element) => element.getClientRects().length > 0);
        if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); menuButton.current?.focus(); }
        else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuButton.current?.focus(); }
        else if (document.activeElement === menuButton.current) { event.preventDefault(); (event.shiftKey ? links.at(-1) : links[0])?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 750) setMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(focusFrame); document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); window.removeEventListener('resize', onResize); };
  }, [menuOpen]);

  const navigate = (event, destination) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setMenuOpen(false);
    desktopMore.current?.removeAttribute('open');
    mobileMore.current?.removeAttribute('open');
    onNavigate(destination);
  };

  const links = (mobile = false) => <>
    <a className="nav-link" href="/#work" onClick={(e) => navigate(e, 'work')}>Work</a>
    <a className={`nav-link ${page === 'about' ? 'active' : ''}`} href="/about" aria-current={page === 'about' ? 'page' : undefined} onClick={(e) => navigate(e, 'about')}>About</a>
    <a className={`nav-link ${page === 'resume' ? 'active' : ''}`} href="/resume" aria-current={page === 'resume' ? 'page' : undefined} onClick={(e) => navigate(e, 'resume')}>Résumé</a>
    <Pill href="#footer" onClick={(e) => navigate(e, 'footer')}>Contact</Pill>
    <details ref={mobile ? mobileMore : desktopMore} className="nav-more" onKeyDown={(event) => {
      if (event.key !== 'Escape' || !event.currentTarget.open) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.removeAttribute('open');
      event.currentTarget.querySelector('summary')?.focus();
    }} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.removeAttribute('open');
    }}>
      <summary className="nav-link">More</summary>
      <div className="nav-more-links">
        <a className={`nav-link ${page === 'playtime' ? 'active' : ''}`} href="/playtime" aria-current={page === 'playtime' ? 'page' : undefined} onClick={(e) => navigate(e, 'playtime')}>Playtime</a>
        <a className={`nav-link ${page === 'hub' ? 'active' : ''}`} href="/desk" aria-current={page === 'hub' ? 'page' : undefined} onClick={(e) => navigate(e, 'hub')}>Design desk</a>
        <a className={`nav-link ${page === 'notes' ? 'active' : ''}`} href="/notes" aria-current={page === 'notes' ? 'page' : undefined} onClick={(e) => navigate(e, 'notes')}>Notes</a>
      </div>
    </details>
  </>;

  return <>
    <header ref={header} className={`site-header ${hidden && !menuOpen ? 'is-hidden' : ''}`}>
      <div className="announcement">{profile.announcement}</div>
      <div className="header-inner container">
        <a className="brand" href="/" aria-label={`${profile.brand} home`} onClick={(e) => navigate(e, 'home')}><Selection><img src={imagery.logo} width="54" height="55" alt={profile.brand} /></Selection></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links()}</nav>
        <button ref={menuButton} className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      </div>
    </header>
    <ReadingProgress active={page === 'case'} headerHidden={hidden && !menuOpen} />
    <nav ref={mobileNav} id="mobile-navigation" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" inert={!menuOpen}>
      <div className="mobile-nav-content">{links(true)}<SocialLinks /><p className="mobile-note">Complex problems. Thoughtful products.<br />A little care in every detail.</p></div>
    </nav>
  </>;
}
