import { useCallback, useEffect, useRef, useState } from 'react';
import SubmissionForm from '../components/SubmissionForm.jsx';
import HeroArtwork from '../components/HeroArtwork.jsx';
import Icon from '../components/Icon.jsx';
import { Pill, Selection } from '../components/ui.jsx';
import { backendConfigured } from '../lib/supabase.js';
import { formatDate, portfolioApi } from '../lib/portfolio-api.js';
import usePageMeta from '../hooks/usePageMeta.js';
import '../styles/notes.css';

export default function Notes() {
  usePageMeta({ title: 'Notes — Ankit Chandrakar', description: "Thoughts, vibes, or just a quick hello. I'm all ears.", path: '/notes' });
  const [notes, setNotes] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(backendConfigured);
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);
  const addButton = useRef(null);
  const tile = useRef(null);
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
  const openComposer = () => {
    setComposing(true);
    // Focus after the form is un-hidden, unless the visitor already focused a field.
    requestAnimationFrame(() => { if (!tile.current?.contains(document.activeElement)) tile.current?.querySelector('textarea')?.focus(); });
  };
  // Collapsing keeps the draft (the form stays mounted), so nothing typed is lost.
  const closeComposer = () => { setComposing(false); requestAnimationFrame(() => addButton.current?.focus()); };
  return <div className="notes-page">
    <section className="hero hero-compact notes-hero" aria-labelledby="notes-title">
      <div className="container hero-grid">
        <div className="hero-copy notes-intro">
          <p className="notes-eyebrow">A small exchange</p>
          <h1 id="notes-title">Leave a little love.</h1>
          <p className="hero-introduction notes-description">Thoughts, vibes, or just a quick hello. I'm all ears.</p>
          <p className="notes-review">Every note is reviewed before publication. Your email stays private.</p>
          <div ref={tile} className={`note-tile${composing ? ' is-open' : ''}`}>
            <button type="button" ref={addButton} className="note-new" onClick={openComposer} aria-expanded={composing} aria-controls="note-composer" hidden={composing}><Icon name="plus" size={20} /><span>Add a note</span></button>
            <div id="note-composer" className="note-tile-form" hidden={!composing}><SubmissionForm compact onCancel={closeComposer} /></div>
          </div>
        </div>
        <div className="hero-art"><HeroArtwork videoSrc="/assets/notes.mp4" poster={null} ariaLabel="Animated illustration for the Notes page" /></div>
      </div>
    </section>
    <div className="container notes-content">
    <section className="notes-wall" aria-labelledby="notes-wall-heading">
      <div className="notes-wall-heading"><h2 id="notes-wall-heading">Published notes</h2></div>
      {!backendConfigured && <p className="configuration-notice">The notes wall is not connected yet. Approved notes will appear here once it is configured.</p>}
      {loading && <p className="notes-state" role="status">Loading notes…</p>}
      {error && <div className="notes-state" role="alert"><p>{error}</p><Pill onClick={() => load(failedMore.current)} disabled={loading}>Retry notes</Pill></div>}
      {notes.length > 0 && <div className="notes-list">
        {notes.map((note) => <Selection as="article" className="public-note" key={note.id}><p className="note-content">{note.message}</p><footer><h3>{note.name}</h3><span>{formatDate(note.approved_at)}</span></footer></Selection>)}
      </div>}
      {backendConfigured && !loading && !error && notes.length === 0 && <p className="notes-empty">No published notes yet. Yours could be the first — after a little review.</p>}
      {hasMore && <div className="notes-more"><Pill onClick={() => load(true)} disabled={loading}>Load more notes</Pill></div>}
    </section>
    </div>
  </div>;
}
