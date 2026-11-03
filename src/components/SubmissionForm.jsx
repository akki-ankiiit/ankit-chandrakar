import { useEffect, useId, useRef, useState } from 'react';
import { backendConfigured, submissionsConfigured } from '../lib/supabase.js';
import { ApiError, portfolioApi } from '../lib/portfolio-api.js';
import Turnstile from './Turnstile.jsx';
import { Pill } from './ui.jsx';
import '../styles/notes.css';

const length = (value) => Array.from(value).length;
const controls = /[\u0000-\u001f\u007f]/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubmissionForm({ kind = 'note', autoFocus = false, onCancel }) {
  const isNote = kind === 'note';
  const ready = isNote ? backendConfigured : submissionsConfigured;
  const prefix = useId();
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '', botcheck: '' });
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const [hint, setHint] = useState('');
  const inFlight = useRef(false);
  const attempt = useRef(null);
  const request = useRef(null);
  const formRef = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (autoFocus) formRef.current?.querySelector('textarea')?.focus(); }, [autoFocus]);
  const update = (event) => {
    const { name } = event.target;
    const limits = { name: 100, email: 254, subject: 150, message: isNote ? 500 : 5000 };
    const value = limits[name] ? Array.from(event.target.value).slice(0, limits[name]).join('') : event.target.value;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    if (!inFlight.current) { setFeedback(''); setHint(''); setStatus('idle'); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (inFlight.current || !ready) return;
    setHint('');
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    payload.botcheck = values.botcheck;
    const next = {};
    if (!payload.name || length(payload.name) > 100 || controls.test(payload.name)) next.name = 'Enter a name of up to 100 characters.';
    if ((!isNote || payload.email) && (!emailPattern.test(payload.email) || length(payload.email) > 254 || controls.test(payload.email))) next.email = 'Enter a valid email address of up to 254 characters.';
    if (!isNote && (!payload.subject || length(payload.subject) > 150 || controls.test(payload.subject))) next.subject = 'Enter a subject of up to 150 characters.';
    if (!payload.message || length(payload.message) > (isNote ? 500 : 5000)) next.message = `Enter a message of up to ${isNote ? 500 : 5000} characters.`;
    setErrors(next);
    if (Object.keys(next).length) {
      const first = (isNote ? ['message', 'name', 'email'] : ['name', 'email', 'subject', 'message']).find((key) => next[key]);
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    if (!isNote && !token) { setFeedback('Please complete the security check.'); setStatus('error'); return; }
    if (isNote) delete payload.subject;
    const fingerprint = JSON.stringify(payload);
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: crypto.randomUUID() };
    inFlight.current = true;
    setStatus('sending'); setFeedback('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await portfolioApi(isNote ? 'submit-note' : 'submit-message', { ...payload, ...(isNote ? {} : { captchaToken: token }), idempotencyKey: attempt.current.key }, { signal: controller.signal });
      if (!result.success) throw new Error('Submission failed');
      if (controller.signal.aborted) return;
      setStatus('success');
      setFeedback(isNote ? 'Thanks for leaving a note! Your message has been submitted and is awaiting approval.' : 'Your message has been sent. Thanks for reaching out!');
      setValues({ name: '', email: '', subject: '', message: '', botcheck: '' });
      attempt.current = null;
    } catch (error) {
      if (controller.signal.aborted) return;
      if (import.meta.env.DEV) console.error(`[${kind}] submission failed`, error?.status, error?.message);
      setStatus('error');
      setFeedback(isNote && error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
      if (!isNote && error instanceof ApiError && [400, 403, 409, 429, 503].includes(error.status)) setHint(error.message);
    } finally {
      inFlight.current = false;
      if (!controller.signal.aborted && !isNote) { setToken(''); setResetKey((value) => value + 1); }
    }
  };
  const field = (name, label, max, type = 'text', required = true) => <label className="submission-field" htmlFor={`${prefix}-${name}`}>
    <span id={`${prefix}-${name}-label`}>{label}</span>
    <input id={`${prefix}-${name}`} name={name} type={type} value={values[name]} onChange={update} required={required} maxLength={max * 2} autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : 'off'} aria-labelledby={`${prefix}-${name}-label`} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${prefix}-${name}-error` : undefined} />
    {errors[name] && <span className="field-error" id={`${prefix}-${name}-error`}>{errors[name]}</span>}
  </label>;
  const noteMessage = <label className="submission-field" htmlFor={`${prefix}-message`}><span id={`${prefix}-message-label`}>{isNote ? 'Your note' : 'Your message'}</span><textarea id={`${prefix}-message`} name="message" rows={isNote ? 5 : 4} placeholder={isNote ? 'Say something...' : undefined} value={values.message} onChange={update} required maxLength={isNote ? 1000 : 10000} aria-labelledby={`${prefix}-message-label`} aria-invalid={Boolean(errors.message)} aria-describedby={`${prefix}-counter${errors.message ? ` ${prefix}-message-error` : ''}`} />
        <span className="character-count" id={`${prefix}-counter`} aria-live="polite">{length(values.message)} / {isNote ? 500 : 5000}</span>
        {errors.message && <span className="field-error" id={`${prefix}-message-error`}>{errors.message}</span>}
      </label>;
  return <form ref={formRef} onSubmit={submit} className={`submission-form contact-form ${isNote ? 'note-form' : 'message-form'}`} noValidate aria-label={isNote ? 'Leave a note' : 'Send a message'}>
    <fieldset disabled={status === 'sending'}>
      {isNote ? noteMessage : null}
      <div className="contact-fields">{field('name', 'Your name', 100)}{field('email', isNote ? 'Email (optional, kept private)' : 'Your email', 254, 'email', !isNote)}</div>
      {!isNote && field('subject', 'Subject', 150)}
      {!isNote && noteMessage}
      <input type="text" name="botcheck" className="honeypot" value={values.botcheck} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden="true" />
    </fieldset>
    {!ready && <p className="configuration-notice">{isNote ? 'Notes' : 'Message delivery'} is not configured yet. Submissions are currently unavailable. Please check back later.</p>}
    {!isNote && <Turnstile action="portfolio-message" onToken={setToken} resetKey={resetKey} />}
    <div className="form-bottom"><Pill type="submit" disabled={!ready || (!isNote && !token) || status === 'sending'}>{status === 'sending' ? 'Sending…' : isNote ? 'Post' : 'Send Message'}</Pill>{onCancel && <button type="button" className="text-link note-cancel" onClick={onCancel} disabled={status === 'sending'}>{status === 'success' ? 'Close' : 'Cancel'}</button>}</div>
    <p className={`form-status ${status}`} role="status" aria-live="polite">{feedback}</p>
    {hint && <p className="security-help submission-hint" role="status" aria-live="polite">{hint}</p>}
  </form>;
}
