import { imagery, profile } from '../data/portfolio.js';
import { Reveal, SocialLinks } from './ui.jsx';
import SubmissionForm from './SubmissionForm.jsx';
import { Link } from 'react-router-dom';

export default function Contact({ visitor = false }) {
  return (
    <footer id="footer" className={`footer${visitor ? ' has-visitor' : ''}`}>
      {visitor && <img className="footer-visitor" src="/assets/footer-visitor.webp" alt="" aria-hidden="true" />}
      <div className="container contact-grid">
        <Reveal className="contact-copy">
          <img className="contact-ink-doodle" src={imagery.companion} alt="" width="440" height="340" loading="lazy" />
          <h2>Send a letter</h2>
          <p>{profile.contact}</p>
          <div className="footer-socials"><SocialLinks /><span className="email-link">{profile.email}</span></div>
          <a className="phone-link" href={`tel:${profile.telephone}`}>{profile.phone}</a>
          <p><Link to="/notes">Leave a note →</Link></p>
          <p className="colophon">© {new Date().getFullYear()} {profile.fullName}. Made with intention.</p>
        </Reveal>
        <Reveal className="contact-form-wrap" delay={100}>
          <SubmissionForm kind="message" />
        </Reveal>
      </div>
    </footer>
  );
}
