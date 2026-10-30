import { useRef, useState } from 'react';
import { imagery, profile } from '../data/portfolio.js';
import { Pill, Reveal, SocialLinks } from './ui.jsx';

export default function Contact({ visitor = false }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const submitting = useRef(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get('botcheck')) return;
    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
    if (!accessKey) {
      const subject = encodeURIComponent(`A little letter from ${data.get('name')}`);
      const body = encodeURIComponent(`${data.get('message')}\n\nFrom ${data.get('name')}\n${data.get('email')}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus('draft');
      setMessage('Your letter is ready in your email app. Press send there to post it.');
      return;
    }
    submitting.current = true;
    setStatus('sending');
    setMessage('Sending your little letter…');
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: accessKey, name: data.get('name'), email: data.get('email'), message: data.get('message'), subject: `A new portfolio letter from ${data.get('name')}` }), signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Could not send');
      setStatus('success');
      setMessage('Thank you! Your letter has been sent by pigeon.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage(`The pigeon lost its way. Please try again or email ${profile.email}.`);
    } finally { submitting.current = false; }
  };

  return (
    <footer id="footer" className={`footer${visitor ? ' has-visitor' : ''}`}>
      {visitor && <img className="footer-visitor" src="/assets/footer-visitor.png" alt="" aria-hidden="true" />}
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
            <div className="form-bottom"><Pill type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Posting…' : status === 'success' ? 'Posted!' : 'Post'}</Pill><p className={`form-status ${status}`} role="status" aria-live="polite">{message}</p></div>
          </form>
        </Reveal>
      </div>
    </footer>
  );
}
