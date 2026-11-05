import { ImageTrail } from '../interactive/ImageTrail';

/**
 * Same stage as "Keep moving": a full-height light section where the pointer leaves a trail.
 * Here the trail is the footer's flowers, scattered around a centred illustration
 * (45vh, fixed where it was, so only the bottom of the section moves) under a "Shiva-Shakti" title set like "Pocket Vibes".
 * Like "Keep moving", it keeps producing flowers while the pointer rests (`idle`), and it is denser than the
 * footer (`dense`). The flower layer listens on its parent <section> and hides itself on touch and reduced motion.
 */
export const FlowerTrailSection = () => (
  <section
    className="flower-trail-section relative w-full h-[76vh] bg-[#F7F7F7] overflow-hidden cursor-crosshair"
    aria-labelledby="flower-trail-heading"
  >
    <header className="flower-trail-heading">
      <h2 id="flower-trail-heading">Shiva-Shakti</h2>
    </header>
    <img
      src="/assets/Shiva-Shakti.svg"
      alt="Illustration of Shiva and Shakti"
      width={593}
      height={1162}
      decoding="async"
      draggable={false}
      className="absolute left-1/2 top-[128px] z-10 h-[47.9vh] w-auto max-w-[80vw] -translate-x-1/2 object-contain select-none pointer-events-none"
    />
    <ImageTrail variant="flower" dense idle />
  </section>
);
