import { useState } from 'react';
import { imagery, profile } from '../data/portfolio.js';
import { Pill, Reveal, SocialLinks } from './ui.jsx';

export default function Contact({ visitor = false }) {
  const [message, setMessage] = useState('');

  // Temporarily restore email-app drafts while Notes is disabled.
  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get('botcheck')) return;
    const subject = encodeURIComponent(`A little letter from ${data.get('name')}`);
    const body = encodeURIComponent(`${data.get('message')}\n\nFrom ${data.get('name')}\n${data.get('email')}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setMessage('Your letter is ready in your email app. Press send there to post it.');
  };

  return (
    <footer id="footer" className={`footer${visitor ? ' has-visitor' : ''}`}>
      {visitor && <img className="footer-visitor" src="/assets/footer-visitor.png" alt="" aria-hidden="true" />}
      <div className="container footer-signoff">
        <h2 className="signoff-title">That’s All Folks <span>(For Now)</span></h2>
        <p className="signoff-lead">Coffee, collab, or chaos - take your pick! I’m up for all three.</p>
        <p className="signoff-note">If something sparked your curiosity — let’s talk design, drama, or destinations.</p>
      </div>
      <div className="container contact-grid">
        <Reveal className="contact-copy">
          <img className="contact-ink-doodle" src={imagery.companion} alt="" width="440" height="340" loading="lazy" />
          <h2>Send a letter</h2>
          <p>{profile.contact}</p>
          <div className="footer-socials"><SocialLinks /><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}</a></div>
          <a className="phone-link" href={`tel:${profile.telephone}`}>{profile.phone}</a>
          <p className="colophon">© {new Date().getFullYear()} {profile.fullName}. Made with intention.</p>
        </Reveal>
        <Reveal className="contact-form-wrap" delay={100}>
          <form onSubmit={onSubmit} className="contact-form">
            <div className="contact-fields">
              <label><span className="sr-only">Your name</span><input name="name" type="text" placeholder="name" autoComplete="name" required maxLength={100} /></label>
              <label><span className="sr-only">Your email</span><input name="email" type="email" placeholder="email" autoComplete="email" required maxLength={254} /></label>
            </div>
            <label><span className="sr-only">Your letter</span><textarea name="message" placeholder="write your letter" rows={4} required maxLength={5000} /></label>
            <input type="checkbox" name="botcheck" className="honeypot" tabIndex={-1} aria-hidden="true" />
            <div className="form-bottom"><Pill type="submit">Post</Pill><p className={`form-status${message ? ' draft' : ''}`} role="status" aria-live="polite">{message}</p></div>
          </form>
        </Reveal>
      </div>
    </footer>
  );
}
