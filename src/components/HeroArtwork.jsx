import { useEffect, useRef } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';

export default function HeroArtwork({
  videoSrc = '/assets/herovideo-hero-paper.mp4',
  ariaLabel = 'Animated illustration of a young designer waving, with a backpack, sketchbook, and sneakers',
}) {
  const stage = useRef(null);
  const video = useRef(null);
  const animationFrame = useRef(null);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const resetPosition = () => {
    cancelAnimationFrame(animationFrame.current);
    stage.current?.style.setProperty('--art-x', '0px');
    stage.current?.style.setProperty('--art-y', '0px');
    stage.current?.style.setProperty('--art-rotate', '0deg');
  };

  useEffect(() => {
    if (reduceMotion) {
      resetPosition();
      video.current?.pause();
    } else {
      video.current?.play().catch(() => {});
    }
    return () => cancelAnimationFrame(animationFrame.current);
  }, [reduceMotion]);

  const onPointerMove = (event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = stage.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      stage.current?.style.setProperty('--art-x', `${x * 8}px`);
      stage.current?.style.setProperty('--art-y', `${y * 6}px`);
      stage.current?.style.setProperty('--art-rotate', `${x * 0.9}deg`);
    });
  };

  return (
    <div className="ink-hero" ref={stage} onPointerMove={onPointerMove} onPointerLeave={resetPosition}>
      <div className="ink-art-canvas">
        <video
          ref={video}
          className="ink-hero-image"
          src={videoSrc}
          width="848"
          height="1072"
          muted
          loop
          playsInline
          autoPlay
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
