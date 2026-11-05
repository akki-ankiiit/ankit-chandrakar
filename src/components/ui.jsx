import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { profile } from '../data/portfolio.js';

export function Selection({ children, className = '', as = 'span', ...props }) {
  const Tag = as;
  return <Tag {...props} className={`selection ${className}`}>{children}<span className="selection-frame" aria-hidden="true">{['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'].map((position) => <i key={position} className={position} />)}</span></Tag>;
}

export function Pill({ children, href, onClick, type = 'button', className = '', disabled = false, ...props }) {
  const Tag = href ? 'a' : 'button';
  return <Selection className={`pill-wrap ${className}`}><Tag className="pill" href={href} onClick={onClick} type={href ? undefined : type} disabled={href ? undefined : disabled} {...props}><Icon size={12} /><span>{children}</span></Tag></Selection>;
}

export function SocialLinks({ className = '', children }) {
  return <div className={`social-links ${className}`}>{profile.socials.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noreferrer" aria-label={`${social.name} (opens in a new tab)`}><Icon name={social.icon} size={17} /></a>)}{children}</div>;
}

export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (typeof window.IntersectionObserver !== 'function') {
      ref.current?.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</div>;
}
