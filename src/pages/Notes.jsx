import { useCallback, useEffect, useRef, useState } from 'react';
import SubmissionForm from '../components/SubmissionForm.jsx';
import HeroArtwork from '../components/HeroArtwork.jsx';
import { Pill } from '../components/ui.jsx';
import { backendConfigured } from '../lib/supabase.js';
import { formatDate, portfolioApi } from '../lib/portfolio-api.js';
import usePageMeta from '../hooks/usePageMeta.js';
import '../styles/notes.css';

export default function Notes() {
  usePageMeta({ title: 'Notes — Ankit Chandrakar', description: "A little space for thoughts, feedback, or a hello. I'd love to hear from you.", path: '/notes' });
  const [notes, setNotes] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(backendConfigured);
  const [error, setError] = useState('');
  const offset = useRef(0);
  const request = useRef(null);
  const busy = useRef(false);
  const failedMore = useRef(false);
  const load = useCallback(async (more = false) => {
    if (!backendConfigured || busy.current) return;
    busy.current = true;
    const controller = new AbortController();
    request.current = controller;
    failedMore.current = more;
    setLoading(true); setError('');
    try {
      const result = await portfolioApi('list-notes', { offset: more ? offset.current : 0, limit: 12 }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!Array.isArray(result.notes)) throw new Error('Could not load notes. Please try again.');
      setNotes((previous) => more ? [...new Map([...previous, ...result.notes].map((note) => [note.id, note])).values()] : result.notes);
      offset.current = (more ? offset.current : 0) + result.notes.length;
      setHasMore(Boolean(result.hasMore));
    } catch (failure) { if (!controller.signal.aborted) setError(failure.message); }
    finally { if (request.current === controller) busy.current = false; if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => { load(); return () => { request.current?.abort(); busy.current = false; }; }, [load]);
  return <div className="notes-page">
    <section className="hero hero-compact notes-hero" aria-labelledby="notes-title">
      <div className="container hero-grid">
        <div className="hero-copy notes-intro">
          <p className="notes-eyebrow">A small exchange</p>
          <h1 id="notes-title">Leave a Note</h1>
          <p className="hero-introduction notes-description">A little space for thoughts, feedback, or a hello. I'd love to hear from you.</p>
          <p className="notes-review">Every note is reviewed before publication. Your email stays private.</p>
        </div>
        <div className="hero-art"><HeroArtwork videoSrc="/assets/notes.mp4" ariaLabel="Animated illustration for the Notes page" /></div>
      </div>
    </section>
    <div className="container notes-content">
    <section className="notes-compose" aria-label="Write a note"><div><span className="notes-flourish" aria-hidden="true">✳</span><h2>A few words,<br />a little connection.</h2><p>Something that resonated? An idea to share? Leave it here.</p></div><SubmissionForm /></section>
    <section className="notes-wall" aria-labelledby="notes-wall-heading">
      <div className="notes-wall-heading"><div><p className="notes-eyebrow">From the visitors’ book</p><h2 id="notes-wall-heading">Notes left here</h2></div><Pill onClick={() => load()} disabled={loading || !backendConfigured}>Refresh notes</Pill></div>
      {!backendConfigured && <p className="configuration-notice">The notes wall is not connected yet. Approved notes will appear here once it is configured.</p>}
      {loading && <p role="status">Loading notes…</p>}
      {error && <div role="alert"><p>{error}</p><Pill onClick={() => load(failedMore.current)} disabled={loading}>Retry notes</Pill></div>}
      {backendConfigured && !loading && !error && notes.length === 0 && <p className="notes-empty">No published notes yet. Yours could be the first — after a little review.</p>}
      <div className="notes-list">{notes.map((note) => <article className="public-note" key={note.id}><p className="note-content">{note.message}</p><footer><span className="note-initials" aria-hidden="true">{String(note.name || '?').trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join('').toLocaleUpperCase()}</span><div><h3>{note.name}</h3><span>{formatDate(note.approved_at)}</span></div></footer></article>)}</div>
      {hasMore && <div className="notes-more"><Pill onClick={() => load(true)} disabled={loading}>Load more notes</Pill></div>}
    </section>
    </div>
  </div>;
}
