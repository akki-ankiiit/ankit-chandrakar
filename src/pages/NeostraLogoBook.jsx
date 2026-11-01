import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { neostraMeta } from '../data/neostra-meta.js';
import bookHtml from '../data/neostra-logo-book.html?raw';

const brandFonts =
  'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap';

export default function NeostraLogoBook() {
  usePageMeta(neostraMeta);
  const bookRef = useRef(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = brandFonts;
    document.head.append(link);
    return () => link.remove();
  }, []);

  useEffect(() => {
    const node = bookRef.current;
    if (!node) return;
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || !node.contains(link)) return;
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      const target = id && node.querySelector(`[id="${id}"]`);
      if (!target) return;
      event.preventDefault();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    node.addEventListener('click', onClick);
    return () => node.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    bookRef.current?.querySelector(`[id="${id}"]`)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, []);

  return (
    <article className="case-study-page nlb-page">
      <div className="case-container">
        <div className="case-breadcrumb">
          <Link to="/#work" state={{ category: 'brand-design' }}>
            <Icon name="arrow" size={15} />Back to selected work
          </Link>
          <span>BRAND IDENTITY / NEOSTRA</span>
        </div>
      </div>
      <div className="nlb" ref={bookRef} dangerouslySetInnerHTML={{ __html: bookHtml }} />
    </article>
  );
}
