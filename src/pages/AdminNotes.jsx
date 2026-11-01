import { useCallback, useEffect, useRef, useState } from 'react';
import { backendConfigured, supabase } from '../lib/supabase.js';
import { formatDate, portfolioApi } from '../lib/portfolio-api.js';
import { Pill } from '../components/ui.jsx';
import '../styles/notes.css';

const tabs = ['pending', 'approved', 'rejected', 'messages'];
const initialCounts = { pending: 0, approved: 0, rejected: 0, unread: 0 };

export default function AdminNotes() {
  const [authLoading, setAuthLoading] = useState(backendConfigured);
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const authBusy = useRef(false);
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState(initialCounts);
  const [countsKnown, setCountsKnown] = useState(false);
  const countsRef = useRef(initialCounts);
  const [failures, setFailures] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const offset = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [denied, setDenied] = useState(false);
  const [notice, setNotice] = useState('');
  const [arrival, setArrival] = useState('');
  const [acting, setActing] = useState(false);
  const actionBusy = useRef(false);
  const activeAction = useRef(null);
  const listBusy = useRef(false);
  const generation = useRef(0);
  const requests = useRef(new Set());
  const mounted = useRef(false);
  const cancelRequests = useCallback(() => {
    generation.current += 1;
    requests.current.forEach((controller) => controller.abort());
    requests.current.clear();
    listBusy.current = false;
  }, []);
  const clearPrivate = useCallback(() => {
    cancelRequests();
    setRows([]); setCounts(initialCounts); countsRef.current = initialCounts;
    setCountsKnown(false);
    setFailures(0); setHasMore(false); offset.current = 0;
    setError(''); setNotice(''); setArrival(''); setDenied(false);
    setLoading(false); setActing(false); actionBusy.current = false; activeAction.current = null;
  }, [cancelRequests]);

  useEffect(() => {
    const existing = document.head.querySelector('meta[name="robots"]');
    const meta = existing || document.createElement('meta');
    const previous = meta.getAttribute('content');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    if (!existing) document.head.append(meta);
    return () => { if (existing) meta.setAttribute('content', previous || ''); else meta.remove(); };
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) return () => { mounted.current = false; };
    let active = true;
    let authEvent = 0;
    const accept = (next) => {
      if (!active) return;
      if (next?.access_token !== sessionRef.current?.access_token || next?.user?.id !== sessionRef.current?.user?.id) clearPrivate();
      sessionRef.current = next;
      setSession(next); setAuthLoading(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => { authEvent += 1; accept(next); });
    const version = authEvent;
    supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!active || authEvent !== version) return;
      if (failure) { setAuthError('Could not restore your session. Please sign in again.'); accept(null); }
      else accept(data.session);
    }).catch(() => { if (active && authEvent === version) { setAuthError('Could not restore your session. Please sign in again.'); accept(null); } });
    return () => { active = false; mounted.current = false; subscription.unsubscribe(); cancelRequests(); sessionRef.current = null; };
  }, [cancelRequests, clearPrivate]);

  const authorizedRequest = useCallback(async (action, payload, version) => {
    const current = sessionRef.current;
    if (!current?.access_token) throw new Error('Please sign in again.');
    const controller = new AbortController();
    requests.current.add(controller);
    try {
      const result = await portfolioApi(action, payload, { token: current.access_token, signal: controller.signal });
      if (!mounted.current || controller.signal.aborted || version !== generation.current || current.access_token !== sessionRef.current?.access_token) return null;
      return result;
    } catch (failure) {
      if (!mounted.current || controller.signal.aborted || version !== generation.current || current.access_token !== sessionRef.current?.access_token) return null;
      if (failure.status === 401 || failure.status === 403) {
        clearPrivate();
        setDenied(true);
        setError(failure.status === 401 ? 'Your session has expired. Sign out and sign in again.' : 'Access denied. This account is not authorized to manage the portfolio.');
      }
      throw failure;
    } finally { requests.current.delete(controller); }
  }, [clearPrivate]);

  const load = useCallback(async (more = false) => {
    if (!sessionRef.current || listBusy.current || actionBusy.current || denied) return;
    listBusy.current = true;
    const version = ++generation.current;
    setLoading(true); setError('');
    try {
      const result = await authorizedRequest('list-admin', { tab, offset: more ? offset.current : 0, limit: 20 }, version);
      if (!result) return;
      const items = tab === 'messages' ? result.messages : result.notes;
      if (!Array.isArray(items) || !result.counts) throw new Error('Could not load the inbox. Please try again.');
      setRows((previous) => more ? [...new Map([...previous, ...items].map((row) => [row.id, row])).values()] : items);
      offset.current = (more ? offset.current : 0) + items.length;
      setHasMore(Boolean(result.hasMore)); setCounts(result.counts); countsRef.current = result.counts;
      setCountsKnown(true);
      setFailures(result.notificationFailures || 0); setArrival('');
    } catch (failure) { if (mounted.current && version === generation.current) setError(failure.message); }
    finally { if (version === generation.current) { listBusy.current = false; setLoading(false); } }
  }, [authorizedRequest, denied, tab]);

  useEffect(() => {
    if (!session || denied) return undefined;
    setRows([]); offset.current = 0; setHasMore(false);
    load();
    return cancelRequests;
  }, [session, tab, load, cancelRequests, denied]);

  useEffect(() => {
    if (!session || denied) return undefined;
    let polling = false;
    const timer = setInterval(async () => {
      if (document.visibilityState !== 'visible' || polling || actionBusy.current || listBusy.current) return;
      polling = true;
      const version = generation.current;
      try {
        const result = await authorizedRequest('list-admin', { tab, offset: 0, limit: 1 }, version);
        if (!result || actionBusy.current || !result.counts) return;
        const previous = countsRef.current;
        const newNotes = Math.max(0, result.counts.pending - previous.pending);
        const newMessages = Math.max(0, result.counts.unread - previous.unread);
        if (newNotes || newMessages) setArrival(`${newNotes ? `${newNotes} new pending note${newNotes === 1 ? '' : 's'}. ` : ''}${newMessages ? `${newMessages} new unread message${newMessages === 1 ? '' : 's'}. ` : ''}Refresh to load the latest entries.`);
        countsRef.current = result.counts; setCounts(result.counts); setFailures(result.notificationFailures || 0);
        setCountsKnown(true);
      } catch (failure) { if (version === generation.current) setError(failure.message); }
      finally { polling = false; }
    }, 45000);
    return () => clearInterval(timer);
  }, [session, denied, authorizedRequest, tab]);

  const login = async (event) => {
    event.preventDefault();
    if (authBusy.current || !supabase) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    authBusy.current = true; setSigningIn(true); setAuthError('');
    try {
      const { error: failure } = await supabase.auth.signInWithPassword({ email: String(data.get('email')).trim(), password: String(data.get('password')) });
      if (failure && mounted.current) setAuthError('Could not sign in. Check your email and password and try again.');
      if (!failure) form.reset();
    } catch { if (mounted.current) setAuthError('Could not sign in. Please try again.'); }
    finally { authBusy.current = false; if (mounted.current) setSigningIn(false); }
  };
  const logout = async () => {
    sessionRef.current = null; setSession(null); clearPrivate();
    try {
      const { error: failure } = await supabase.auth.signOut({ scope: 'local' });
      if (failure && mounted.current) setAuthError('Could not finish signing out. Please try again.');
    } catch { if (mounted.current) setAuthError('Could not finish signing out. Please try again.'); }
  };
  const act = async (action, payload, confirmation) => {
    if (actionBusy.current || listBusy.current || denied || !sessionRef.current) return;
    if (confirmation && !window.confirm(confirmation)) return;
    actionBusy.current = true; setActing(true); setNotice(''); setError('');
    const actionId = Symbol();
    activeAction.current = actionId;
    const version = ++generation.current;
    try {
      const result = await authorizedRequest(action, payload, version);
      if (!result) return;
      if (action !== 'retry-notifications' && !result.success) throw new Error('The action could not be completed. Please try again.');
      setNotice(action === 'retry-notifications' ? `Notification retry: ${result.sent} sent, ${result.failed} failed. Backoff or expired notifications may not be retried yet.` : 'Saved.');
      actionBusy.current = false;
      await load();
    } catch (failure) { if (mounted.current && version === generation.current) setError(failure.message); }
    finally { if (mounted.current && activeAction.current === actionId) { activeAction.current = null; actionBusy.current = false; setActing(false); } }
  };

  return <div className="admin-notes-page container">
    <header className="notes-intro"><p className="notes-eyebrow">Private correspondence</p><h1>Notes & messages</h1><p>Review the visitors’ book and your private inbox.</p></header>
    {!backendConfigured ? <p className="configuration-notice">The admin connection is not configured yet. Sign-in is unavailable.</p> : authLoading ? <p role="status">Restoring your session…</p> : !session ? <section className="admin-login" aria-labelledby="admin-login-heading"><h2 id="admin-login-heading">Owner sign in</h2><p>Use your manually provisioned owner account.</p><form className="contact-form submission-form" onSubmit={login}><label>Email<input name="email" type="email" autoComplete="username" maxLength={254} required disabled={signingIn} /></label><label>Password<input name="password" type="password" autoComplete="current-password" required disabled={signingIn} /></label><Pill type="submit" disabled={signingIn}>{signingIn ? 'Signing in…' : 'Sign in'}</Pill></form>{authError && <p role="alert">{authError}</p>}</section> : <>
      <div className="admin-toolbar"><Pill onClick={logout}>Sign out</Pill>{!denied && <Pill onClick={() => load()} disabled={loading || acting}>Refresh inbox</Pill>}</div>
      {error && <div className="admin-error" role="alert"><p>{error}</p>{!denied && <Pill onClick={() => load()} disabled={loading || acting}>Retry inbox</Pill>}</div>}
      {!denied && <>
        <div className="admin-tabs" role="group" aria-label="Inbox folders">{tabs.map((item) => <button key={item} type="button" aria-pressed={tab === item} disabled={acting || loading} onClick={() => { if (item !== tab) { cancelRequests(); setRows([]); setTab(item); } }}>{item} <span>{item === 'messages' ? `${countsKnown ? counts.unread : '—'} unread` : countsKnown ? counts[item] : '—'}</span></button>)}</div>
        <p className="admin-arrival" role="status" aria-live="polite">{arrival}</p>
        <p role="status" aria-live="polite">{notice}</p>
        <div className="admin-notifications"><p>Notification failures: {countsKnown ? failures : 'unavailable'}. Retries send due notifications only; some may be in backoff or expired.</p><Pill onClick={() => act('retry-notifications', {})} disabled={acting || loading}>Retry notifications</Pill></div>
        {loading && <p role="status">Loading inbox…</p>}
        {!loading && !error && rows.length === 0 && <p className="notes-empty">No {tab === 'messages' ? 'messages' : `${tab} notes`} here.</p>}
        <section aria-label={`${tab} entries`} className="admin-entries">{rows.map((row) => <article className="admin-entry" key={row.id}>
          <header><h2>{row.name}</h2><span>{row.status} · {formatDate(row.created_at)}</span></header>
          {row.email && <p className="admin-email">{row.email}</p>}
          {tab === 'messages' && <h3>{row.subject}</h3>}
          <p className="note-content">{row.message}</p>
          {row.approved_at && <p>Approved {formatDate(row.approved_at)}</p>}
          <div className="admin-entry-actions">{tab === 'messages' ? <>
            <Pill disabled={acting || loading} onClick={() => act('update-message', { id: row.id, status: row.status === 'unread' ? 'read' : 'unread' })}>{row.status === 'unread' ? 'Mark read' : 'Mark unread'}</Pill>
            {row.status !== 'archived' && <Pill disabled={acting || loading} onClick={() => act('update-message', { id: row.id, status: 'archived' }, 'Archive this message? It will remain in your private inbox as archived.')}>Archive</Pill>}
          </> : <>
            {row.status !== 'approved' && <Pill disabled={acting || loading} onClick={() => act('moderate-note', { id: row.id, status: 'approved' }, 'Publish this note on the public notes wall?')}>Approve</Pill>}
            {row.status !== 'rejected' && <Pill disabled={acting || loading} onClick={() => act('moderate-note', { id: row.id, status: 'rejected' }, 'Reject this note? It will not appear on the public wall.')}>Reject</Pill>}
            <Pill className="destructive-action" disabled={acting || loading} onClick={() => act('delete-note', { id: row.id }, 'Permanently delete this note? This cannot be undone.')}>Delete</Pill>
          </>}</div>
        </article>)}</section>
        {hasMore && <Pill onClick={() => load(true)} disabled={loading || acting}>Load more entries</Pill>}
      </>}
    </>}
  </div>;
}
