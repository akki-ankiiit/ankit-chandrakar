import { useEffect, useRef, useState } from "react";
import { PocketPlayer } from "../interactive/PocketPlayer";

const VIDEO_URL = "/assets/video/pocket-player-web.mp4";
const POSTER_URL = "/assets/video/pocket-player-poster.webp";

export const PocketPlayerSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let loaded = false;
    let autoplayBlocked = false;
    let disposed = false;
    let playPending = false;
    let playInterrupted = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      video.src = VIDEO_URL;
      video.load();
    };
    const shouldPlay = () => visible && !document.hidden && !motion.matches && !autoplayBlocked;
    const syncPlayback = () => {
      if (!shouldPlay()) {
        if (playPending) playInterrupted = true;
        video.pause();
      } else if (loaded && !video.error && video.paused && !playPending) {
        playPending = true;
        playInterrupted = false;
        video.play().then(() => {
          // Visibility or motion preferences may change while play() is pending.
          if (disposed || !shouldPlay()) video.pause();
        }).catch((error: unknown) => {
          // Policy denial must not cause an automatic retry loop.
          autoplayBlocked = error instanceof DOMException && error.name === "NotAllowedError";
        }).finally(() => {
          const reconcile = playInterrupted && !autoplayBlocked;
          playPending = false;
          playInterrupted = false;
          // An intervening visibility change may have been blocked by playPending.
          if (!disposed && reconcile && shouldPlay()) syncPlayback();
        });
      }
    };
    const nearObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      load();
      syncPlayback();
      nearObserver.disconnect();
    }, { rootMargin: "200px" });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) load();
      syncPlayback();
    });
    const onMotionChange = () => {
      setReducedMotion(motion.matches);
      syncPlayback();
    };
    // Observe the stable figure even when the static poster replaces the video.
    const illustration = video.parentElement!;
    nearObserver.observe(illustration);
    visibilityObserver.observe(illustration);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", onMotionChange);

    return () => {
      disposed = true;
      nearObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", onMotionChange);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <section className="pocket-vibes-section" aria-labelledby="pocket-vibes-heading">
      <header className="pocket-vibes-heading">
        <p>Music Player</p>
        <h2 id="pocket-vibes-heading">Pocket Vibes</h2>
      </header>

      <div className="pocket-vibes-composition">
        <div className="pocket-vibes-player" data-pocket-player><PocketPlayer /></div>
        <figure className="pocket-vibes-illustration" data-pocket-illustration>
          {(failed || reducedMotion) && <img className="pocket-vibes-video" src={POSTER_URL} alt="Illustration of a boy holding a pocket music player" />}
          <video
            ref={videoRef}
            className="pocket-vibes-video"
            data-pocket-video
            hidden={failed || reducedMotion}
            poster={POSTER_URL}
            preload="metadata"
            muted
            loop
            playsInline
            aria-label="Animated illustration of a boy holding a pocket music player"
            onError={() => setFailed(true)}
          />
        </figure>
      </div>
    </section>
  );
};
