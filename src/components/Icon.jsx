import { FaBehance, FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter } from 'react-icons/fa6';

const brands = { linkedin: FaLinkedinIn, behance: FaBehance, x: FaXTwitter, instagram: FaInstagram, tiktok: FaTiktok };

export default function Icon({ name = 'star', size = 18, ...props }) {
  const Brand = brands[name];
  if (Brand) return <Brand size={size} aria-hidden="true" focusable="false" {...props} />;
  const paths = {
    star: <path d="M12 1.5c1.1 6.3 4.2 9.4 10.5 10.5-6.3 1.1-9.4 4.2-10.5 10.5C10.9 16.2 7.8 13.1 1.5 12 7.8 10.9 10.9 7.8 12 1.5Z" fill="currentColor" stroke="none" />,
    books: <><path d="M4 20V8h4v12M10 20V4h4v16M17 20l-2-11 4-.7 2 11M2 21h20" /><path d="M5 11h2M11 7h2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    play: <path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="4" /></>,
    volume: <><path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></>,
    muted: <><path d="m11 4-6 5H2v6h3l6 5ZM16 9l6 6M16 15l6-6" /></>,
    shop: <><path d="M3 9h18l-2-6H5ZM4 9v12h16V9M9 21v-7h6v7" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    expand: <><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.star}</svg>;
}
