import { useEffect, useRef, useState } from 'react';
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const MotionButton = motion.button;
const MotionDiv = motion.div;

// Snap carousel ported from the Playtime experiment: cards fan out from the centre, drag or click to snap,
// and each snap plays a short mechanical tick.
const ITEM_WIDTH = 200;

let audioCtx = null;

function playTick() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const click = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    click.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    click.type = 'square';
    click.frequency.setValueAtTime(600, now);
    click.frequency.exponentialRampToValueAtTime(50, now + 0.02);
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    click.start();
    click.stop(now + 0.02);

    const ping = audioCtx.createOscillator();
    const pingGain = audioCtx.createGain();
    ping.connect(pingGain);
    pingGain.connect(audioCtx.destination);
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(2000, now);
    ping.frequency.exponentialRampToValueAtTime(100, now + 0.02);
    pingGain.gain.setValueAtTime(0.3, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    ping.start();
    ping.stop(now + 0.02);
  } catch {
    // Audio is optional; ignore failures.
  }
}

// Signed distance (in scroll space) between the current scroll position and a card's resting position.
function wrappedDiff(scroll, index, total) {
  const totalWidth = total * ITEM_WIDTH;
  const diff = scroll + index * ITEM_WIDTH;
  let wrapped = ((diff % totalWidth) + totalWidth) % totalWidth;
  if (wrapped > totalWidth / 2) wrapped -= totalWidth;
  return wrapped;
}

function SnapCard({ item, index, total, scrollX, onSelect }) {
  const x = useTransform(scrollX, (value) => {
    const diff = wrappedDiff(value, index, total);
    const dist = Math.abs(diff / ITEM_WIDTH);
    const sign = Math.sign(diff);
    return dist <= 1 ? sign * dist * 220 : sign * (220 + (dist - 1) * 45);
  });

  const scale = useTransform(scrollX, (value) => {
    const dist = Math.abs(wrappedDiff(value, index, total) / ITEM_WIDTH);
    return dist <= 1 ? 1 - dist * 0.7 : Math.max(0.1, 0.3 - (dist - 1) * 0.03);
  });

  const opacity = useTransform(scrollX, (value) => {
    const dist = Math.abs(wrappedDiff(value, index, total) / ITEM_WIDTH);
    return dist <= 1 ? 1 : Math.max(0, 1 - (dist - 1) * 0.15);
  });

  const zIndex = useTransform(scrollX, (value) => {
    const dist = Math.abs(wrappedDiff(value, index, total) / ITEM_WIDTH);
    return 100 - Math.round(dist);
  });

  return (
    <MotionButton
      type="button"
      className="sx-snap-card"
      style={{ x, scale, opacity, zIndex }}
      onClick={() => onSelect(index)}
      data-index={index}
      aria-label={`Open post ${index + 1}: ${item.alt}`}
    >
      <img src={item.src} alt="" width={item.width} height={item.height} draggable={false} loading="lazy" decoding="async" />
    </MotionButton>
  );
}

export default function SnapGallery({ items, onOpen }) {
  const total = items.length;
  const totalWidth = total * ITEM_WIDTH;
  const scrollX = useMotionValue(0);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const controls = useAnimation();

  useEffect(() => scrollX.on('change', (value) => {
    const normalized = ((-value % totalWidth) + totalWidth) % totalWidth;
    const closest = Math.round(normalized / ITEM_WIDTH) % total;
    if (closest !== activeRef.current) {
      activeRef.current = closest;
      setActive(closest);
      playTick();
      controls.start({ scale: [1, 0.98, 1], transition: { duration: 0.2, ease: 'easeOut' } });
    }
  }), [scrollX, controls, totalWidth, total]);

  const springTo = (target) => animate(scrollX, target, { type: 'spring', stiffness: 150, damping: 18, mass: 1 });

  const snapToIndex = (index) => {
    const current = scrollX.get();
    const diff = wrappedDiff(current, index, total);
    springTo(current - diff);
  };

  const onPan = (_event, info) => scrollX.set(scrollX.get() + info.delta.x * 0.6);

  const onPanEnd = (_event, info) => {
    const projected = scrollX.get() + info.velocity.x * 0.2;
    springTo(Math.round(projected / ITEM_WIDTH) * ITEM_WIDTH);
  };

  const onSelect = (index) => {
    if (index === activeRef.current) onOpen(index);
    else snapToIndex(index);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      snapToIndex((activeRef.current - 1 + total) % total);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      snapToIndex((activeRef.current + 1) % total);
    }
  };

  return (
    <div className="sx-snap" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="ShineX social posts" onKeyDown={onKeyDown}>
      <MotionDiv className="sx-snap-track" onPan={onPan} onPanEnd={onPanEnd}>
        {items.map((item, index) => (
          <SnapCard key={item.number} item={item} index={index} total={total} scrollX={scrollX} onSelect={onSelect} />
        ))}
      </MotionDiv>
      <MotionDiv className="sx-snap-frame" animate={controls} aria-hidden="true">
        <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
      </MotionDiv>
      <p className="sx-snap-caption" aria-live="polite">
        <span>{active + 1} / {total}</span>
        {items[active].alt}
      </p>
    </div>
  );
}
