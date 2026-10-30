import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
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

// Maps project group → Work tab category ID
const groupToCategory = { products: 'case-studies', websites: 'websites', apps: 'apps', systems: 'design-systems' };

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [category, setCategory] = useState('case-studies');
  const scrollPositions = useRef(new Map());
  const page = location.pathname === '/desk' ? 'hub' : location.pathname.startsWith('/work/') ? 'case' : 'home';

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
    if (page !== 'case') document.title = page === 'hub' ? 'Design desk — Ankit Chandrakar' : 'Ankit Chandrakar — Lead Product Designer';
  }, [page]);

  const onNavigate = (destination) => {
    if (destination === 'hub') navigate('/desk');
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
          <Route path="/work/kamdhenu-k-series" element={<KSeriesCaseStudy />} />
          <Route path="/work/bondure" element={<BondureCaseStudy />} />
          <Route path="/work/shinex-crystalx" element={<ShineXCrystalXCaseStudy />} />
          <Route path="/work/:projectId" element={<CaseStudy />} />
          <Route path="*" element={<section className="not-found container"><p className="eyebrow">A page out of place</p><h1>This chapter hasn’t been written.</h1><Link className="text-link" to="/">Back to the portfolio ↗</Link></section>} />
        </Routes>
      </main>
      <Contact />
    </>
  );
}
