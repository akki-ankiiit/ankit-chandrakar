import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';
import { packagingNeighbours } from '../../data/packaging.js';

// Shared building blocks for the packaging case studies, so all three share one hierarchy:
// hero (client, title, one-line summary, facts), numbered sections (number, title, one-line lede), role, pager.

export function PkHero({ crumb, client, title, subtitle, facts, children }) {
  return (
    <header className="pk-hero case-container">
      <div className="case-breadcrumb">
        <Link to="/#work" state={{ category: 'packaging-designs' }}><Icon name="arrow" size={15} />Back to selected work</Link>
        <span>{crumb}</span>
      </div>
      <p className="pk-client">{client}</p>
      <h1>{title}</h1>
      <p className="pk-subtitle">{subtitle}</p>
      <dl className="pk-facts">
        {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {children && <div className="pk-hero-art">{children}</div>}
    </header>
  );
}

export function PkSection({ id, number, title, lede, className = '', children }) {
  return (
    <section className={`pk-section ${className}`} aria-labelledby={id}>
      <div className="pk-head">
        <span className="pk-no">{number}</span>
        <h2 id={id}>{title}</h2>
        {lede && <p>{lede}</p>}
      </div>
      {children}
    </section>
  );
}

export function PkRole({ id, number, items }) {
  return (
    <PkSection id={id} number={number} title="My role">
      <ul className="pk-role" role="list">
        {items.map((item) => <li key={item}><Icon name="check" size={16} />{item}</li>)}
      </ul>
    </PkSection>
  );
}

export function PkPager({ current }) {
  const { previous, next } = packagingNeighbours(current);
  return (
    <div className="case-container">
      <nav className="pk-pager" aria-label="More packaging case studies">
        <Link className="pk-pager-link is-previous" to={previous.href}>
          <span className="pk-pager-label">Previous</span>
          <span className="pk-pager-title"><Icon name="arrow" size={20} />{previous.title}</span>
        </Link>
        <Link className="pk-pager-link is-next" to={next.href}>
          <span className="pk-pager-label">Next</span>
          <span className="pk-pager-title">{next.title}<Icon name="arrow" size={20} /></span>
        </Link>
      </nav>
    </div>
  );
}
