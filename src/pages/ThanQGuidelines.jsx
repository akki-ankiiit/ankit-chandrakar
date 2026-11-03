import { useEffect, useRef } from 'react';
import ProjectBackLink from '../components/ProjectBackLink.jsx';
import SnapGallery from '../components/SnapGallery.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { thanqMeta } from '../data/thanq-meta.js';
import prepareThanQPresentation from './thanq-presentation.js';
import '../styles/thanq-guidelines.css';

const galleryImages = [
  { file: '01-mumbai-waiter.webp', width: 1152, height: 1536, alt: 'A Mumbai waiter receives thanks for attentive service.' },
  { file: '02-bengaluru-delivery.webp', width: 1152, height: 1536, alt: 'A Bengaluru delivery courier and customer share a moment of appreciation.' },
  { file: '03-jaipur-housekeeping.webp', width: 1152, height: 1536, alt: 'A Jaipur hotel guest thanks a housekeeper.' },
  { file: '04-pune-salon.webp', width: 1152, height: 1536, alt: 'A Pune salon stylist is appreciated by a client.' },
  { file: '05-delhi-driver.webp', width: 1152, height: 1536, alt: 'A Delhi driver receives appreciation from a passenger.' },
  { file: '06-whatsapp-business.webp', width: 1536, height: 1024, alt: 'ThanQ WhatsApp Business profile displayed on a phone in a café.' },
  { file: '06-whatsapp-business-artwork.webp', width: 1600, height: 900, alt: 'ThanQ WhatsApp cover artwork reading “A little thanks. A lasting difference”.' },
  { file: '07-linkedin.webp', width: 1536, height: 1024, alt: 'ThanQ LinkedIn company page displayed on a laptop.' },
  { file: '08-x-twitter.webp', width: 1536, height: 1024, alt: 'ThanQ X profile displayed on a laptop.' },
  { file: '08-x-twitter-artwork.webp', width: 1500, height: 500, alt: 'ThanQ X header artwork reading “Great service. Real appreciation”.' },
  { file: '09-instagram-pinned.webp', width: 1536, height: 1024, alt: 'ThanQ Instagram profile and pinned posts displayed on a phone.' },
  { file: '09-instagram-pinned-artwork.webp', width: 1080, height: 1350, alt: 'Instagram artwork with a server and customer, reading “Good service deserves a ThanQ”.' },
  { file: '10-mumbai-worli.webp', width: 1536, height: 1024, alt: 'ThanQ billboard along the Mumbai Worli waterfront.' },
  { file: '11-bengaluru-whitefield.webp', width: 1536, height: 1024, alt: 'ThanQ delivery appreciation billboard in Bengaluru Whitefield.' },
  { file: '12-delhi-aerocity.webp', width: 1536, height: 1024, alt: 'ThanQ driver appreciation billboard in Delhi Aerocity.' },
  { file: '13-bengaluru-expo-booth.webp', width: 1536, height: 1024, alt: 'ThanQ branded exhibition booth at a Bengaluru expo.' },
  { file: '14-delhi-conference-stage.webp', width: 1536, height: 1024, alt: 'ThanQ Delhi conference stage displaying “Recognise Respect Reward”.' },
  { file: '15-mumbai-conference-rollups.webp', width: 1536, height: 1024, alt: 'ThanQ hospitality roll-up banners at a Mumbai conference.' },
].map((item) => ({ ...item, id: item.file, src: `/assets/ThanQ%20SMP/${item.file}`, thumb: `/assets/ThanQ%20SMP/thumbs/${item.file}` }));

export default function ThanQGuidelines() {
  const cleanup = useRef(null);
  usePageMeta(thanqMeta);

  useEffect(() => () => cleanup.current?.(), []);

  function prepareGuidelines(event) {
    cleanup.current?.();
    cleanup.current = prepareThanQPresentation(event.currentTarget);
  }

  return (
    <article className="thanq-guidelines" aria-label="ThanQ brand guidelines">
      <div className="thanq-guidelines-presentation">
        <nav className="thanq-guidelines-backbar" aria-label="Brand design navigation">
          <ProjectBackLink state={{ category: 'brand-design', focusProject: 'thanq' }} label="Back to Brand Design" />
        </nav>
        <iframe
          className="thanq-guidelines-frame"
          src="/assets/ThanQ/ThanQ_Brand_Guidelines.html"
          title="ThanQ brand guidelines — 39 slides covering brand identity and applications"
          allowFullScreen
          onLoad={prepareGuidelines}
        />
      </div>
      <section className="thanq-guidelines-gallery" aria-labelledby="thanq-gallery-heading">
        <header className="thanq-guidelines-gallery-heading">
          <p>Brand in action</p>
          <h2 id="thanq-gallery-heading">ThanQ in the world.</h2>
        </header>
        <SnapGallery items={galleryImages} ariaLabel="ThanQ brand applications" />
      </section>
    </article>
  );
}
