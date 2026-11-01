import { useEffect, useRef, useState } from 'react';
import { turnstileSiteKey } from '../lib/supabase.js';

let scriptPromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      const timeout = setTimeout(() => { script.remove(); reject(new Error('Unavailable')); }, 15000);
      script.onload = () => { clearTimeout(timeout); if (window.turnstile) resolve(window.turnstile); else { script.remove(); reject(new Error('Unavailable')); } };
      script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('Unavailable')); };
      document.head.append(script);
    }).catch((error) => { scriptPromise = undefined; throw error; });
  }
  return scriptPromise;
}

export default function Turnstile({ action, onToken, resetKey = 0 }) {
  const container = useRef(null);
  const callback = useRef(onToken);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  useEffect(() => { callback.current = onToken; }, [onToken]);
  useEffect(() => {
    if (!turnstileSiteKey) return undefined;
    let active = true;
    let widget;
    let api;
    callback.current('');
    const timeout = setTimeout(() => { if (active) setStatus('error'); }, 15000);
    loadTurnstile().then((loaded) => {
      if (!active) return;
      api = loaded;
      widget = api.render(container.current, {
        sitekey: turnstileSiteKey, action, theme: 'light', size: 'flexible',
        callback: (token) => { if (active) { setStatus('ready'); callback.current(token); } },
        'expired-callback': () => { if (active) { callback.current(''); setStatus('expired'); } },
        'error-callback': () => { if (active) { callback.current(''); setStatus('error'); } },
      });
      clearTimeout(timeout);
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => {
      active = false;
      clearTimeout(timeout);
      if (api && widget !== undefined) api.remove(widget);
    };
  }, [action, resetKey, retry]);
  if (!turnstileSiteKey) return <p className="security-help">Security verification is not configured yet. Submissions are unavailable.</p>;
  return <div className="security-check">
    <div ref={container} />
    <p role="status">{status === 'loading' ? 'Loading security check…' : status === 'expired' ? 'Security check expired. Please verify again.' : status === 'error' ? 'Security check unavailable. Please retry or check your connection.' : ''}</p>
    {(status === 'error' || status === 'expired') && <button type="button" onClick={() => { setStatus('loading'); setRetry((value) => value + 1); }}>Retry security check</button>}
  </div>;
}
