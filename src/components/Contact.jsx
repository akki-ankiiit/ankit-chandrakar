import { createElement, lazy, Suspense } from 'react';
import { FaBehance, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { profile } from '../data/portfolio.js';
import { Pill, Reveal } from './ui.jsx';
// Footer message form (email sending) is switched off for now. To bring it back, restore this import
// and the commented <SubmissionForm kind="message" /> block below.
// import SubmissionForm from './SubmissionForm.jsx';
import '../styles/footer.css';

// GSAP-driven flower trail is split out so it never blocks the footer's first paint.
const FlowerTrail = lazy(() => import('../playtime-app/components/interactive/ImageTrail.tsx').then(({ ImageTrail }) => ({ default: () => createElement(ImageTrail, { variant: 'flower' }) })));

const socialIcons = { linkedin: FaLinkedinIn, behance: FaBehance, x: FaXTwitter };

export default function Contact({ visitor = false }) {
  return (
    <footer id="footer" className={`footer ft${visitor ? ' has-visitor' : ''}`}>
      {visitor && <img className="footer-visitor" src="/assets/footer-visitor.webp" alt="" aria-hidden="true" />}
      <Suspense fallback={null}><FlowerTrail /></Suspense>
      <Reveal className="container ft-inner">
        {/* 1. The ask */}
        <h2>Let’s talk product design.</h2>
        <p className="ft-lede">{profile.availability} Have a role or a complex product challenge in mind? I’d love to hear about it.</p>

        {/* 2. Direct contact and résumé */}
        <div className="ft-actions">
          <Pill href={`mailto:${profile.email}`}>Email me</Pill>
          <Pill className="ft-secondary" href={profile.resume} download>Download résumé</Pill>
        </div>
        <a className="text-link contact-email" href={`mailto:${profile.email}`}>{profile.email}</a>
        {/* 3. Elsewhere */}
        <div className="ft-elsewhere">
          <ul className="ft-socials" aria-label="Social links">
            {profile.socials.map((social) => {
              const Glyph = socialIcons[social.icon];
              return <li key={social.name}><a href={social.url} target="_blank" rel="noreferrer" aria-label={`${social.name} (opens in a new tab)`}><Glyph size={20} aria-hidden="true" /></a></li>;
            })}
          </ul>
          <a className="ft-phone" href={`tel:${profile.telephone}`}>{profile.phone}</a>
        </div>
        {/* Footer message form (email sending): disabled for now.
        <div className="contact-form-wrap">
          <SubmissionForm kind="message" />
        </div>
        */}
        {/* 4. Sign-off */}
        <nav className="footer-page-links" aria-label="Explore more">
          <Link to="/#work">Work</Link><Link to="/about">About</Link><Link to="/resume">Résumé</Link><Link to="/playtime">Playtime</Link><Link to="/desk">Design desk</Link><Link to="/notes">Leave a note</Link>
        </nav>
        <p className="ft-colophon">© {new Date().getFullYear()} {profile.fullName}. Made with love &amp; a lot of effort.</p>
      </Reveal>
      {/* Rolling hills along the foot of the footer. The pale sky multiplies into the footer colour, so only the hills show. */}
      <img className="ft-landscape" src="/assets/footer/meadow-2880.webp" srcSet="/assets/footer/meadow-1200.webp 1200w, /assets/footer/meadow-2880.webp 2880w" sizes="100vw" width="2880" height="792" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </footer>
  );
}
