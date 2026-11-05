import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Impact from './components/Impact.jsx';
import Work from './components/Work.jsx';
import CreatorHub from './components/CreatorHub.jsx';
import Contact from './components/Contact.jsx';
import Experience from './components/Experience.jsx';
import NotFound from './pages/NotFound.jsx';
import usePageMeta from './hooks/usePageMeta.js';
import { homeMeta } from './data/home-meta.js';
const CaseStudy = lazy(() => import('./pages/CaseStudy.jsx'));
const KSeriesCaseStudy = lazy(() => import('./pages/KSeriesCaseStudy.jsx'));
const BondureCaseStudy = lazy(() => import('./pages/BondureCaseStudy.jsx'));
const ShineXCrystalXCaseStudy = lazy(() => import('./pages/ShineXCrystalXCaseStudy.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const Playtime = lazy(() => import('./pages/Playtime.jsx'));
const NeostraLogoBook = lazy(() => import('./pages/NeostraLogoBook.jsx'));
const ContractorBhaiCaseStudy = lazy(() => import('./pages/ContractorBhaiCaseStudy.jsx'));
const AtlasCaseStudy = lazy(() => import('./pages/AtlasCaseStudy.jsx'));
const AdhikarCaseStudy = lazy(() => import('./pages/AdhikarCaseStudy.jsx'));
const ThanQGuidelines = lazy(() => import('./pages/ThanQGuidelines.jsx'));
const Resume = lazy(() => import('./pages/Resume.jsx'));
const Notes = lazy(() => import('./pages/Notes.jsx'));
const AdminNotes = lazy(() => import('./pages/AdminNotes.jsx'));

// Maps project group → Work tab category ID
const groupToCategory = { products: 'case-studies', websites: 'websites', apps: 'case-studies', systems: 'design-systems' };

// Commit restoration only once the destination's code and CSS are ready.
function RouteScrollRestoration({ restoration }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    const pending = restoration.current;
    const saved = pending.saved;
    let frame;
    let complete = false;
    const restore = () => {
      if (complete || restoration.current !== pending) return;
      const shadow = document.querySelector('.playtime-shadow-host')?.shadowRoot;
      const playtimePending = location.pathname === '/playtime' && !shadow?.getElementById('top');
      const target = location.hash ? document.getElementById(location.hash.slice(1)) || shadow?.getElementById(location.hash.slice(1)) : null;
      if (navigationType === 'POP' && saved !== undefined) {
        // The experiment wrappers reserve the full page height once ready.
        if (playtimePending) return;
        window.scrollTo({ top: saved, behavior: 'instant' });
      } else if (target) target.scrollIntoView({ behavior: 'instant' });
      else if (location.hash && playtimePending) return;
      else window.scrollTo({ top: 0, behavior: 'instant' });
      complete = true;
      pending.restoring = false;
      const projectLink = location.state?.focusProject && document.querySelector(`[data-project-link="${location.state.focusProject}"]`);
      (projectLink || document.getElementById('main'))?.focus({ preventScroll: true });
    };
    const scheduleRestore = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(restore);
    };
    window.addEventListener('playtime-ready', scheduleRestore);
    scheduleRestore();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('playtime-ready', scheduleRestore);
    };
  }, [location, navigationType, restoration]);
  return null;
}

function RouteLoading() {
  return <div className="route-loading" role="status" aria-live="polite"><p className="sr-only">Loading page…</p></div>;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState('case-studies');
  const scrollPositions = useRef(new Map());
  const restoration = useRef({ key: location.key, restoring: true, saved: undefined });
  if (restoration.current.key !== location.key) {
    restoration.current = { key: location.key, restoring: true, saved: scrollPositions.current.get(location.key) };
  }
  const page = location.pathname === '/notes' ? 'notes' : location.pathname === '/admin/notes' ? 'admin-notes' : location.pathname === '/desk' ? 'hub' : location.pathname === '/about' ? 'about' : location.pathname === '/resume' ? 'resume' : location.pathname === '/playtime' ? 'playtime' : /^\/work\/[^/]+$/.test(location.pathname) ? 'case' : location.pathname === '/' ? 'home' : 'not-found';
  usePageMeta(homeMeta, page === 'home');

  useEffect(() => {
    const rememberScroll = () => {
      if (restoration.current.key === location.key && !restoration.current.restoring) {
        scrollPositions.current.set(location.key, window.scrollY);
      }
    };
    window.addEventListener('scroll', rememberScroll, { passive: true });
    return () => window.removeEventListener('scroll', rememberScroll);
  }, [location.key]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    if (location.hash === '#hub') { navigate('/desk', { replace: true }); return; }
    if (location.state?.category) {
      const mapped = groupToCategory[location.state.category] || location.state.category;
      setCategory(mapped);
    }
  }, [location, navigate]);

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
    else if (page === 'resume') document.title = 'My Resume — Ankit Chandrakar';
    else if (page === 'notes') document.title = 'Notes — Ankit Chandrakar';
    else if (page === 'admin-notes') document.title = 'Private notes — Ankit Chandrakar';
    else if (page !== 'case') document.title = page === 'hub' ? 'Design desk — Ankit Chandrakar' : homeMeta.title;
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
        <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<div className="page-enter"><Hero onNavigate={onNavigate} /><About /><Work active={category} onCategoryChange={setCategory} /><Experience /><Impact /></div>} />
          <Route path="/desk" element={<div className="page-enter"><Hero isHub onNavigate={onNavigate} /><CreatorHub /></div>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/notes" element={<Suspense fallback={<p className="container" role="status" style={{ paddingTop: 180 }}>Loading notes…</p>}><Notes /></Suspense>} />
          <Route path="/admin/notes" element={<Suspense fallback={<p className="container" role="status" style={{ paddingTop: 180 }}>Loading sign-in…</p>}><AdminNotes /></Suspense>} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/playtime" element={<Playtime />} />
          <Route path="/agents" element={<Navigate to="/work/helix#agents" replace />} />
          <Route path="/work/mistribhai" element={<Navigate to="/work/helix" replace />} />
          <Route path="/work/kamdhenu-k-series" element={<KSeriesCaseStudy />} />
          <Route path="/work/bondure" element={<BondureCaseStudy />} />
          <Route path="/work/shinex-crystalx" element={<ShineXCrystalXCaseStudy />} />
          <Route path="/work/neostra" element={<NeostraLogoBook />} />
          <Route path="/work/contractorbhai" element={<ContractorBhaiCaseStudy />} />
          <Route path="/work/atlas-brand" element={<AtlasCaseStudy />} />
          <Route path="/work/adhikar-brand" element={<AdhikarCaseStudy />} />
          <Route path="/work/thanq" element={<ThanQGuidelines />} />
          <Route path="/work/:projectId" element={<CaseStudy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <RouteScrollRestoration restoration={restoration} />
        </Suspense>
      </main>
      <Contact visitor />
    </>
  );
}
