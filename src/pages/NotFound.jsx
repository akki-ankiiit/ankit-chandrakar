import { Link, useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

export default function NotFound({
  title = 'This chapter hasn’t been written.',
  message = 'The page you’re looking for may have moved, been renamed, or never made it past the sketchbook. Let’s get you back to familiar ground.',
}) {
  const location = useLocation();
  usePageMeta({ title: 'Page not found — Ankit Chandrakar', description: 'Find your way back to Ankit Chandrakar’s selected product design work, résumé, and contact information.', image: '/assets/social-preview.jpg', path: location.pathname.replace(/\/+$/, '') || '/', siteUrl: 'https://ankit.devs.surf' });

  return (
    <section className="not-found">
      <div className="container not-found-inner">
        <div className="not-found-copy">
          <p className="eyebrow not-found-eyebrow"><Icon name="star" size={12} /> Error 404</p>
          <h1 className="not-found-title">{title}</h1>
          <p className="not-found-text">{message}</p>
          <div className="not-found-actions">
            <Link className="pill not-found-home" to="/"><Icon size={12} /><span>Back to the portfolio</span></Link>
            <Link className="text-link not-found-link" to="/#work">Browse selected work ↗</Link>
          </div>
        </div>

        <div className="not-found-art" aria-hidden="true">
          <div className="not-found-paper">
            <span className="not-found-status">404</span>
            <span className="not-found-label">Page not found</span>
            <svg className="not-found-doodle" viewBox="0 0 320 230" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 184c38-6 58-44 92-51 31-6 41 23 78 12 36-11 45-52 92-63" strokeDasharray="3 7" opacity=".7" />
              <path d="m273 74 10-4-4 10" opacity=".7" />
              <circle cx="160" cy="112" r="50" />
              <circle cx="160" cy="112" r="41" opacity=".45" />
              <path d="M160 47v12M160 165v12M95 112h12M213 112h12" />
              <path d="m142 130 36-36-14 39-9-10-13 7Z" fill="#c5de9b" stroke="currentColor" />
              <circle cx="160" cy="112" r="3.5" fill="currentColor" stroke="none" />
              <path d="m250 176 9 9m0-9-9 9M60 52l8 8m0-8-8 8" />
              <path d="M36 98c-8 0-14 6-14 14M296 128c7 2 11 8 10 15" opacity=".55" />
            </svg>
            <span className="not-found-caption">Filed somewhere else.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
