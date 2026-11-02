import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import '../styles/snap-gallery.css';

const MotionButton = motion.button;
const MotionDiv = motion.div;

// Cards fan out from the centre; drag, click or use the arrow keys to snap.
const ITEM_WIDTH = 200;

function fitCardSize(item, limits) {
  const width = Number.isFinite(item.width) && item.width > 0 ? item.width : 240;
  const height = Number.isFinite(item.height) && item.height > 0 ? item.height : 300;
  const scale = Math.min(limits.maxWidth / width, limits.maxHeight / height);
  return { width: width * scale, height: height * scale };
}

// Signed distance (in scroll space) between the current scroll position and a card's resting position.
function wrappedDiff(scroll, index, total) {
  const totalWidth = total * ITEM_WIDTH;
  const diff = scroll + index * ITEM_WIDTH;
  let wrapped = ((diff % totalWidth) + totalWidth) % totalWidth;
  if (wrapped > totalWidth / 2) wrapped -= totalWidth;
  return wrapped;
}

function SnapCard({ item, size, offset, index, total, scrollX, onSelect, active, canOpen }) {
  const { width, height } = size;
  const x = useTransform(scrollX, (value) => {
    const diff = wrappedDiff(value, index, total);
    const dist = Math.abs(diff / ITEM_WIDTH);
    const sign = Math.sign(diff);
    return dist <= 1 ? sign * dist * offset : sign * (offset + (dist - 1) * 45);
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
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, x, scale, opacity, zIndex }}
      onClick={() => onSelect(index)}
      data-index={index}
      aria-label={`${active ? (canOpen ? 'Open image' : 'Selected image') : 'Select image'} ${index + 1}: ${item.alt}`}
      aria-current={active ? 'true' : undefined}
    >
      <img src={item.src} alt="" width={item.width} height={item.height} draggable={false} loading="lazy" decoding="async" />
    </MotionButton>
  );
}

export default function SnapGallery({ items, onOpen, ariaLabel = 'ShineX social posts' }) {
  const total = items.length;
  const totalWidth = total * ITEM_WIDTH;
  const scrollX = useMotionValue(0);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const controls = useAnimation();
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 408, height: 500 });
  const limits = useMemo(() => ({
    maxWidth: Math.min(360, Math.max(1, stageSize.width - 48)),
    maxHeight: Math.min(420, Math.max(1, stageSize.height - 64)),
  }), [stageSize]);
  const sizes = useMemo(() => items.map((item) => fitCardSize(item, limits)), [items, limits]);
  const activeSize = sizes[active] ?? sizes[0] ?? { width: 0, height: 0 };
  const frameWidth = activeSize.width + 24;
  const frameHeight = activeSize.height + 24;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      setStageSize((previous) => previous.width === width && previous.height === height ? previous : { width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => scrollX.on('change', (value) => {
    if (!total) return;
    const normalized = ((-value % totalWidth) + totalWidth) % totalWidth;
    const closest = Math.round(normalized / ITEM_WIDTH) % total;
    if (closest !== activeRef.current) {
      activeRef.current = closest;
      setActive(closest);
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
    if (index === activeRef.current) onOpen?.(index);
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

  if (!total) return null;

  return (
    <div className="sx-snap" tabIndex={0} role="region" aria-roledescription="carousel" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      <div className="sx-snap-stage" ref={stageRef}>
        <MotionDiv className="sx-snap-track" onPan={onPan} onPanEnd={onPanEnd}>
          {items.map((item, index) => (
            <SnapCard key={item.id ?? item.number ?? item.src} item={item} size={sizes[index]} offset={limits.maxWidth * 0.65 + 60} index={index} total={total} scrollX={scrollX} onSelect={onSelect} active={index === active} canOpen={Boolean(onOpen)} />
          ))}
        </MotionDiv>
        <MotionDiv
          className="sx-snap-frame"
          style={{ width: frameWidth, height: frameHeight, marginLeft: -frameWidth / 2, marginTop: -frameHeight / 2 }}
          animate={controls}
          aria-hidden="true"
        >
          <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />
        </MotionDiv>
      </div>
      <div className="sx-snap-footer">
        <button type="button" className="sx-snap-nav" aria-label="Previous image" onClick={() => snapToIndex((activeRef.current - 1 + total) % total)} disabled={total < 2}>
          <span aria-hidden="true">←</span>
        </button>
        <p className="sx-snap-caption" aria-live="polite" aria-atomic="true">
          <span>{active + 1} / {total}</span>
          {items[active].alt}
        </p>
        <button type="button" className="sx-snap-nav" aria-label="Next image" onClick={() => snapToIndex((activeRef.current + 1) % total)} disabled={total < 2}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
