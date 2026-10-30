import { useEffect, useRef, useState } from 'react';
import { imagery, profile } from '../data/portfolio.js';
import { Pill, Selection, SocialLinks } from './ui.jsx';

export default function Header({ page, onNavigate }) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const previousScroll = useRef(0);
  const menuButton = useRef(null);
  const mobileNav = useRef(null);

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
    mobileNav.current?.querySelector('a')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const links = [...mobileNav.current.querySelectorAll('a')];
        if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); menuButton.current?.focus(); }
        else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuButton.current?.focus(); }
        else if (document.activeElement === menuButton.current) { event.preventDefault(); (event.shiftKey ? links.at(-1) : links[0])?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 750) setMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); window.removeEventListener('resize', onResize); };
  }, [menuOpen]);

  const navigate = (event, destination) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setMenuOpen(false);
    onNavigate(destination);
  };

  const links = <><a className="nav-link" href="/#work" onClick={(e) => navigate(e, 'work')}>My work</a><a className="nav-link" href="/#bio" onClick={(e) => navigate(e, 'bio')}>About</a><a className={`nav-link ${page === 'playtime' ? 'active' : ''}`} href="/playtime" onClick={(e) => navigate(e, 'playtime')}>Playtime</a><a className={`nav-link ${page === 'hub' ? 'active' : ''}`} href="/desk" onClick={(e) => navigate(e, 'hub')}>Design desk</a><Pill href="#footer" onClick={(e) => navigate(e, 'footer')}>Say hello</Pill></>;

  return <>
    <header className={`site-header ${hidden && !menuOpen ? 'is-hidden' : ''}`}>
      <div className="announcement">{profile.announcement}</div>
      <div className="header-inner container">
        <a className="brand" href="/" aria-label={`${profile.brand} home`} onClick={(e) => navigate(e, 'home')}><Selection><img src={imagery.logo} width="54" height="55" alt={profile.brand} /></Selection></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links}</nav>
        <button ref={menuButton} className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      </div>
    </header>
    <nav ref={mobileNav} id="mobile-navigation" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" inert={!menuOpen}>
      <div className="mobile-nav-content">{links}<SocialLinks /><p className="mobile-note">Complex problems. Thoughtful products.<br />A little care in every detail.</p></div>
    </nav>
  </>;
}
