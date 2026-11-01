import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import SnapGallery from '../components/SnapGallery.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { PkHero, PkPager, PkRole, PkSection } from '../components/packaging/CaseParts.jsx';
import { kSeriesCard } from '../data/k-series.js';
import { idea, notes, posts, products, range, role, shinexCard, shinexHero, shinexMeta, socialIntro } from '../data/shinex-crystalx.js';

const accent = (product) => ({ '--accent-product': product.accent });

function Bottles() {
  return (
    <ul className="sx-bottles" role="list" aria-label="The ShineX and CrystalX bottles">
      {products.map((product, index) => (
        <li key={product.id} className="sx-bottle" style={{ '--i': index, '--surface': product.accent }}>
          <img src={product.image.src} width={product.image.width} height={product.image.height} alt={product.alt} decoding="async" fetchPriority={index === 0 ? 'high' : undefined} />
          <span className="sx-surface">{product.surface}</span>
        </li>
      ))}
    </ul>
  );
}

function Idea() {
  return (
    <PkSection id="sx-idea" number="01" title={idea.heading} lede={idea.lede}>
      <Link className="text-link pk-link" to={kSeriesCard.href}>{idea.linkLabel}</Link>
    </PkSection>
  );
}

function Range() {
  return (
    <PkSection id="sx-range" number="02" title={range.heading} lede={range.lede}>
      <ul className="sx-products" role="list">
        {products.map((product) => (
          <li key={product.id} className="sx-product" style={accent(product)}>
            <div className="sx-product-art pk-panel">
              <img src={product.image.src} width={product.image.width} height={product.image.height} alt={product.alt} loading="lazy" decoding="async" />
            </div>
            <div className="sx-product-body">
              <h3 className="sx-product-logo">
                <img src={product.logo.src} width={product.logo.width} height={product.logo.height} alt={product.logo.alt} loading="lazy" decoding="async" />
              </h3>
              <p className="sx-product-meta"><span className="sx-dot" aria-hidden="true" />{product.surface} · 1 L</p>
              <ul className="sx-benefits" role="list" aria-label={`${product.name} benefits`}>
                {product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ul>
      <ul className="pk-points" role="list" aria-label="What the two bottles share">
        {notes.map((note) => <li key={note.title}><b>{note.title}</b><span>{note.text}</span></li>)}
      </ul>
    </PkSection>
  );
}

function SocialGallery() {
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
    document.querySelector(`.sx-snap-card[data-index="${index}"]`)?.focus();
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
      <SnapGallery items={posts} onOpen={setCurrent} />
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
    <PkSection id="sx-social" number="03" title={socialIntro.heading} lede={socialIntro.lede} className="sx-social">
      <SocialGallery />
    </PkSection>
  );
}

export default function ShineXCrystalXCaseStudy() {
  usePageMeta(shinexMeta);

  return (
    <article className="case-study-page pk-page sx-page">
      <PkHero crumb="PACKAGING & SOCIAL / KAMDHENU ADHESIVE" client="Kamdhenu Adhesive" title={shinexHero.title} subtitle={shinexHero.subtitle} facts={shinexHero.facts}>
        <Bottles />
      </PkHero>
      <div className="case-container pk-story">
        <Idea />
        <Range />
        <Social />
        <PkRole id="sx-role" number="04" items={role} />
      </div>
      <PkPager current={shinexCard.id} />
    </article>
  );
}
