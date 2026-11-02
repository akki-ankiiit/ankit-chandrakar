import { useEffect, useRef, useState } from 'react';
import '../styles/case-study-route.css';
import '../styles/packaging-case.css';
import '../styles/shinex-crystalx.css';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import SnapGallery from '../components/SnapGallery.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { PkHero, PkPager, PkRole, PkSection } from '../components/packaging/CaseParts.jsx';
import { kSeriesCard } from '../data/k-series.js';
import { approval, decisions, explored, idea, outcome, pillars, posts, products, range, role, shinexCard, shinexHero, shinexMeta, socialIntro } from '../data/shinex-crystalx.js';

const accent = (product) => ({ '--accent-product': product.accent });
const todo = (text) => (text.startsWith('TODO_USER') ? <mark className="sx-todo-mark">{text}</mark> : text);

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
      <ol className="sx-steps" aria-label="Where these cleaners sit in the floor story">
        {idea.steps.map((step) => <li key={step.label}><span className="sx-step-label">{step.label}</span><p>{step.text}</p></li>)}
      </ol>
      <p className="sx-link"><Link className="text-link" to={kSeriesCard.href}>{idea.linkLabel}</Link></p>
    </PkSection>
  );
}

function Range() {
  return (
    <PkSection id="sx-surface" number="02" title={range.heading} lede={range.lede}>
      <div className="sx-versus">
        {products.map((product) => (
          <article key={product.id} className="sx-side" style={accent(product)}>
            <p className="sx-surface-tag"><span className="sx-dot" aria-hidden="true" />For {product.surface.toLowerCase()} · 1 L</p>
            <h3 className="sx-side-logo">
              <img src={product.logo.src} width={product.logo.width} height={product.logo.height} alt={product.logo.alt} loading="lazy" decoding="async" />
            </h3>
            <ul className="sx-benefits" role="list" aria-label={`${product.name} benefits`}>
              {product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </PkSection>
  );
}

function Decisions() {
  return (
    <PkSection id="sx-decisions" number="03" title="Four decisions that shaped the design." lede="What we chose, and what each choice had to solve on the shelf.">
      <ol className="sx-decisions" role="list">
        {decisions.map((item, index) => (
          <li key={item.title} className="sx-decision">
            <span className="sx-decision-no" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </PkSection>
  );
}

function Process() {
  return (
    <PkSection id="sx-process" number="04" title="From first ideas to an approved direction." lede="The route the range took before it reached the shelf.">
      <div className="sx-process">
        <article className="sx-note-card">
          <h3>{explored.heading}</h3>
          <p>{todo(explored.text)}</p>
        </article>
        <article className="sx-note-card">
          <h3>{approval.heading}</h3>
          <p>{todo(approval.text)}</p>
        </article>
      </div>
    </PkSection>
  );
}

function Outcome() {
  return (
    <PkSection id="sx-outcome" number="06" title={outcome.heading}>
      <p className="sx-note-card sx-todo">{todo(outcome.text)}</p>
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
    <PkSection id="sx-social" number="05" title={socialIntro.heading} lede={socialIntro.lede} className="sx-social">
      <ul className="pk-points sx-pillars" role="list" aria-label="How the posts are grouped">
        {pillars.map((pillar) => <li key={pillar.title}><b>{pillar.title}</b><span>{pillar.text}</span></li>)}
      </ul>
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
        <Decisions />
        <Process />
        <Social />
        <Outcome />
        <PkRole id="sx-role" number="07" items={role} />
      </div>
      <PkPager current={shinexCard.id} />
    </article>
  );
}
