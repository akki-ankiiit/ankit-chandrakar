import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { projects } from '../data/portfolio.js';
import { bondureCard } from '../data/bondure.js';
import { kSeriesCard } from '../data/k-series.js';
import { idea, notes, posts, products, role, shinexHero, shinexMeta, socialIntro } from '../data/shinex-crystalx.js';

const accent = (product) => ({ '--accent-product': product.accent });

function Heading({ number, eyebrow, id, children }) {
  return <div className="case-section-heading"><span className="chapter-number">{number}</span><div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{children}</h2></div></div>;
}

function distribute(entries, count) {
  const columns = Array.from({ length: count }, () => ({ entries: [], height: 0 }));
  for (const entry of entries) {
    const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best));
    shortest.entries.push(entry);
    shortest.height += entry.post.height / entry.post.width;
  }
  return columns.map((column) => column.entries);
}

function Hero() {
  return (
    <header className="case-hero case-container">
      <div className="case-breadcrumb">
        <Link to="/#work" state={{ category: 'packaging-designs' }}><Icon name="arrow" size={15} />Back to selected work</Link>
        <span>PACKAGING &amp; SOCIAL / KAMDHENU ADHESIVE</span>
      </div>
      <div className="case-title-row"><div><p className="eyebrow">Kamdhenu Adhesive</p><h1>{shinexHero.title}</h1><p className="case-subtitle">{shinexHero.subtitle}</p></div></div>
      <ul className="sx-meta" aria-label="Project details">{shinexHero.meta.map((item) => <li key={item}>{item}</li>)}</ul>
      <ul className="sx-bottles" role="list" aria-label="The ShineX and CrystalX bottles">
        {products.map((product, index) => (
          <li key={product.id} className="sx-bottle" style={{ '--i': index, '--surface': product.accent }}>
            <img src={product.image.src} width={product.image.width} height={product.image.height} alt={product.alt} decoding="async" fetchPriority={index === 0 ? 'high' : undefined} />
            <span className="sx-surface">{product.surface}</span>
          </li>
        ))}
      </ul>
    </header>
  );
}

function Idea() {
  return (
    <section className="case-section" aria-labelledby="sx-idea">
      <Heading number="01" eyebrow="The idea" id="sx-idea">{idea.heading}</Heading>
      <p className="case-lead sx-copy">{idea.text}</p>
      <Link className="text-link sx-link" to={kSeriesCard.href}>{idea.linkLabel}</Link>
    </section>
  );
}

function Range() {
  return (
    <section className="case-section" aria-labelledby="sx-range">
      <Heading number="02" eyebrow="The range" id="sx-range">Two products, one family</Heading>
      <ul className="sx-products" role="list">
        {products.map((product) => (
          <li key={product.id} className="sx-product" style={accent(product)}>
            <div className="sx-product-art">
              <img src={product.image.src} width={product.image.width} height={product.image.height} alt={product.alt} loading="lazy" decoding="async" />
            </div>
            <h3 className="sx-product-logo">
              <img src={product.logo.src} width={product.logo.width} height={product.logo.height} alt={product.logo.alt} loading="lazy" decoding="async" />
            </h3>
            <p className="sx-product-meta"><span className="sx-dot" aria-hidden="true" />{product.surface} · 1 L</p>
            <ul className="sx-benefits" role="list" aria-label={`${product.name} benefits`}>
              {product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </li>
        ))}
      </ul>
      <div className="sx-notes">
        {notes.map((note) => (
          <div key={note.title} className="sx-note">
            <h3>{note.title}</h3>
            <p>{note.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialGallery() {
  const wide = useMediaQuery('(min-width: 1000px)');
  const columns = useMemo(() => distribute(posts.map((post, index) => ({ post, index })), wide ? 3 : 2), [wide]);
  const [current, setCurrent] = useState(null);
  const dialog = useRef(null);
  const isOpen = current !== null;

  useEffect(() => {
    const node = dialog.current;
    if (!isOpen) {
      if (node?.open) node.close();
      return;
    }
    if (!node.open) node.showModal();
  }, [current, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  const step = (delta) => setCurrent((index) => (index + delta + posts.length) % posts.length);
  const closed = () => {
    const index = current;
    setCurrent(null);
    document.querySelector(`.sx-post[data-index="${index}"]`)?.focus();
  };
  const onBackdropClick = (event) => {
    if (event.target.matches('.sx-lightbox, .sx-lightbox-inner, .sx-lightbox-stage')) dialog.current.close();
  };
  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
    if (event.key !== 'Tab') return;
    const controls = dialog.current.querySelectorAll('button');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const post = isOpen ? posts[current] : null;

  return (
    <>
      <div className="sx-columns">
        {columns.map((column, columnIndex) => (
          <div className="sx-column" key={columnIndex}>
            {column.map(({ post: item, index }) => (
              <button key={item.number} type="button" className="sx-post" data-index={index} onClick={() => setCurrent(index)}>
                <img src={item.src} width={item.width} height={item.height} alt={item.alt} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <dialog ref={dialog} className="sx-lightbox" aria-label="ShineX social post" onClose={closed} onClick={onBackdropClick} onKeyDown={onKeyDown}>
        {post && (
          <div className="sx-lightbox-inner">
            <div className="sx-lightbox-top">
              <span className="sx-counter" aria-live="polite">{current + 1} / {posts.length}</span>
              <button type="button" className="icon-button" onClick={() => dialog.current.close()} aria-label="Close"><Icon name="close" size={20} /></button>
            </div>
            <div className="sx-lightbox-stage">
              <button type="button" className="icon-button previous" onClick={() => step(-1)} aria-label="Previous post"><Icon name="arrow" /></button>
              <img key={post.number} src={post.src} width={post.width} height={post.height} alt={post.alt} decoding="async" />
              <button type="button" className="icon-button" onClick={() => step(1)} aria-label="Next post"><Icon name="arrow" /></button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function Social() {
  return (
    <section className="case-section sx-social" aria-labelledby="sx-social">
      <Heading number="03" eyebrow="Social media" id="sx-social">{socialIntro.heading}</Heading>
      <p className="case-lead sx-copy">{socialIntro.text}</p>
      <SocialGallery />
    </section>
  );
}

function Role() {
  return (
    <section className="case-section" aria-labelledby="sx-role">
      <Heading number="04" eyebrow="Lead Product Designer" id="sx-role">{role.heading}</Heading>
      <ul className="case-contributions sx-role" role="list">
        {role.items.map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}
      </ul>
    </section>
  );
}

export default function ShineXCrystalXCaseStudy() {
  usePageMeta(shinexMeta);
  const next = projects[0];

  return (
    <article className="case-study-page sx-page">
      <Hero />
      <div className="case-container sx-story">
        <Idea />
        <Range />
        <Social />
        <Role />
      </div>
      <nav className="sx-pager case-container" aria-label="More case studies">
        <Link className="sx-pager-link is-previous" to={bondureCard.href}>
          <span className="sx-pager-label">Previous case study</span>
          <span className="sx-pager-title"><Icon name="arrow" size={26} />{bondureCard.title}</span>
          <span className="sx-pager-note">{bondureCard.category}</span>
        </Link>
        <Link className="sx-pager-link is-next" to={`/work/${next.id}`}>
          <span className="sx-pager-label">Next case study</span>
          <span className="sx-pager-title">{next.title}<Icon name="arrow" size={26} /></span>
          <span className="sx-pager-note">{next.category}</span>
        </Link>
      </nav>
    </article>
  );
}
