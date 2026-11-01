import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Impact from './components/Impact.jsx';
import Work from './components/Work.jsx';
import CreatorHub from './components/CreatorHub.jsx';
import Contact from './components/Contact.jsx';
import Experience from './components/Experience.jsx';
import CaseStudy from './pages/CaseStudy.jsx';
import KSeriesCaseStudy from './pages/KSeriesCaseStudy.jsx';
import BondureCaseStudy from './pages/BondureCaseStudy.jsx';
import ShineXCrystalXCaseStudy from './pages/ShineXCrystalXCaseStudy.jsx';
import NotFound from './pages/NotFound.jsx';
import AboutPage from './pages/AboutPage.jsx';
import usePageMeta from './hooks/usePageMeta.js';
import { homeMeta } from './data/home-meta.js';
const Playtime = lazy(() => import('./pages/Playtime.jsx'));
const NeostraLogoBook = lazy(() => import('./pages/NeostraLogoBook.jsx'));
const Notes = lazy(() => import('./pages/Notes.jsx'));
const AdminNotes = lazy(() => import('./pages/AdminNotes.jsx'));

// Maps project group → Work tab category ID
const groupToCategory = { products: 'case-studies', websites: 'websites', apps: 'apps', systems: 'design-systems' };

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [category, setCategory] = useState('case-studies');
  const scrollPositions = useRef(new Map());
  const page = location.pathname === '/notes' ? 'notes' : location.pathname === '/admin/notes' ? 'admin-notes' : location.pathname === '/desk' ? 'hub' : location.pathname === '/about' ? 'about' : location.pathname === '/playtime' ? 'playtime' : /^\/work\/[^/]+$/.test(location.pathname) ? 'case' : location.pathname === '/' ? 'home' : 'not-found';
  usePageMeta(homeMeta, page === 'home');

  useEffect(() => {
    const rememberScroll = () => scrollPositions.current.set(location.key, window.scrollY);
    window.addEventListener('scroll', rememberScroll, { passive: true });
    return () => window.removeEventListener('scroll', rememberScroll);
  }, [location.key]);

  useEffect(() => {
    if (location.hash === '#hub') { navigate('/desk', { replace: true }); return; }
    if (location.state?.category) {
      const mapped = groupToCategory[location.state.category] || location.state.category;
      setCategory(mapped);
    }
    const frame = requestAnimationFrame(() => {
      const saved = scrollPositions.current.get(location.key);
      const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
      if (navigationType === 'POP' && saved !== undefined) window.scrollTo({ top: saved, behavior: 'instant' });
      else if (target) target.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      const projectLink = location.state?.focusProject && document.querySelector(`[data-project-link="${location.state.focusProject}"]`);
      (projectLink || document.getElementById('main'))?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [location, navigate, navigationType]);

  useEffect(() => {
    if (!location.state?.focusProject || location.pathname !== '/') return undefined;
    const frame = requestAnimationFrame(() => {
      const link = document.querySelector(`[data-project-link="${location.state.focusProject}"]`);
      link?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [category, location]);

  useEffect(() => {
    if (page === 'not-found') document.title = 'Page not found — Ankit Chandrakar';
    else if (page === 'playtime') document.title = 'Playtime — Ankit Chandrakar';
    else if (page === 'about') document.title = 'About — Ankit Chandrakar';
    else if (page === 'notes') document.title = 'Notes — Ankit Chandrakar';
    else if (page === 'admin-notes') document.title = 'Private notes — Ankit Chandrakar';
    else if (page !== 'case') document.title = page === 'hub' ? 'Design desk — Ankit Chandrakar' : 'Ankit Chandrakar — Lead Product Designer';
  }, [page]);

  const onNavigate = (destination) => {
    if (destination === 'hub') navigate('/desk');
    else if (destination === 'about') navigate('/about');
    else if (destination === 'playtime') navigate('/playtime');
    else if (destination === 'notes') navigate('/notes');
    else if (destination === 'home') navigate('/');
    else if (destination === 'footer') navigate(`${location.pathname}#footer`);
    else navigate(`/#${destination}`);
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header page={page} onNavigate={onNavigate} />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<div className="page-enter"><Hero onNavigate={onNavigate} /><About /><Work active={category} onCategoryChange={setCategory} /><Experience /><Impact /></div>} />
          <Route path="/desk" element={<div className="page-enter"><Hero isHub onNavigate={onNavigate} /><CreatorHub /></div>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/notes" element={<Suspense fallback={<p className="container" role="status" style={{ paddingTop: 180 }}>Loading notes…</p>}><Notes /></Suspense>} />
          <Route path="/admin/notes" element={<Suspense fallback={<p className="container" role="status" style={{ paddingTop: 180 }}>Loading sign-in…</p>}><AdminNotes /></Suspense>} />
          <Route path="/playtime" element={<Suspense fallback={<div className="playtime-loading" />}><Playtime /></Suspense>} />
          <Route path="/work/kamdhenu-k-series" element={<KSeriesCaseStudy />} />
          <Route path="/work/bondure" element={<BondureCaseStudy />} />
          <Route path="/work/shinex-crystalx" element={<ShineXCrystalXCaseStudy />} />
          <Route path="/work/neostra" element={<Suspense fallback={<div className="nlb-loading" />}><NeostraLogoBook /></Suspense>} />
          <Route path="/work/:projectId" element={<CaseStudy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Contact visitor />
    </>
  );
}
