import { useState, useRef, useEffect, useCallback, useId } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';

const PLAYLIST = [
  { id: 'Il-an3K9pjg', title: "2002", artist: "Anne-Marie" },
  { id: '4NRXx6U8ABQ', title: "Blinding Lights", artist: "The Weeknd" },
  { id: 'XXYlFuWEuKI', title: "Save Your Tears", artist: "The Weeknd" },
  { id: '34Na4j8HLjc', title: "Starboy", artist: "The Weeknd" },
  { id: 'O1OTWCd40bc', title: "Call Out My Name", artist: "The Weeknd" },
  { id: 'JGwWNGJdvx8', title: "Shape of You", artist: "Ed Sheeran" },
  { id: 'TUVcZfQe-Kw', title: "Levitating", artist: "Dua Lipa" },
  { id: 'H5v3kku4y6Q', title: "As It Was", artist: "Harry Styles" },
  { id: 'kTJczUoc26U', title: "Stay", artist: "The Kid LAROI, Justin Bieber" },
  { id: 'tQ0yjYUVDnI', title: "Peaches", artist: "Justin Bieber" },
  { id: 'E07s5ZYygMg', title: "Watermelon Sugar", artist: "Harry Styles" },
  { id: 'ZmDBbnmKpqQ', title: "Drivers License", artist: "Olivia Rodrigo" },
  { id: 'gNi_6U5Pm_o', title: "Good 4 U", artist: "Olivia Rodrigo" },
  { id: 'OPf0YbXqDm0', title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
  { id: 'q0hyYWKXF0Q', title: "Dance Monkey", artist: "Tones and I" },
  { id: 'zABLecsR5UE', title: "Someone You Loved", artist: "Lewis Capaldi" },
  { id: 'ApXoWvfEYVU', title: "Sunflower", artist: "Post Malone, Swae Lee" },
  { id: 'Pkh8UtuejGw', title: "Senorita", artist: "Shawn Mendes, Camila Cabello" },
  { id: 'DyDfgMOUjCI', title: "Bad Guy", artist: "Billie Eilish" },
  { id: 'bo_efYhYU2A', title: "Shallow", artist: "Lady Gaga, Bradley Cooper" },
  { id: '2Vv-BfVoq4g', title: "Perfect", artist: "Ed Sheeran" },
  { id: 'lp-EO5I60KA', title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: 'PT2_F-1esPk', title: "Closer", artist: "The Chainsmokers" },
  { id: 'hT_nvWreIhg', title: "Counting Stars", artist: "OneRepublic" },
];

const LOAD_TIMEOUT_MS = 12000;
type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
const hasYouTubeApi = () => typeof (window as typeof window & { YT?: { Player?: unknown } }).YT?.Player === 'function';

export const PocketPlayer = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'nowPlaying'>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [status, updateStatus] = useState<PlaybackStatus>('idle');
  const statusRef = useRef<PlaybackStatus>('idle');
  const setStatus = useCallback((next: PlaybackStatus) => {
    statusRef.current = next;
    updateStatus(next);
  }, []);
  const isPlaying = status === 'playing';
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playerRequested, setPlayerRequested] = useState(false);
  const [playerReady, setPlayerReady] = useState<YouTubePlayer | null>(null);
  const [apiReady, setApiReady] = useState(hasYouTubeApi);
  const [attempt, setAttempt] = useState(0);
  const attemptRef = useRef(0);
  const failedRef = useRef(false);
  const menuId = useId();
  const playIntent = useRef(false);
  const mountedRef = useRef(false);
  const generationRef = useRef(0);
  
  const isScrubbing = useRef(false);

  const currentTrack = PLAYLIST[currentTrackIndex];
  const trackRef = useRef(currentTrack.id);
  trackRef.current = currentTrack.id;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      playerRef.current = null;
    };
  }, []);

  const failPlayback = useCallback((session: number) => {
    if (!mountedRef.current || session !== attemptRef.current || failedRef.current) return;
    failedRef.current = true;
    generationRef.current += 1;
    playerRef.current = null;
    setPlayerReady(null);
    playIntent.current = false;
    setStatus('error');
  }, [setStatus]);

  const failed = status === 'error';
  useEffect(() => {
    if (!playerRequested || apiReady || failed) return;
    if (hasYouTubeApi()) { setApiReady(true); return; }
    // A failed SDK load leaves the underlying loader's shared promise pending.
    // Gate react-youtube mounting so Retry can use a fresh SDK script.
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.dataset.pocketYoutubeApi = '';
    const onError = () => failPlayback(attempt);
    script.addEventListener('error', onError);
    const poll = window.setInterval(() => { if (hasYouTubeApi()) setApiReady(true); }, 100);
    const timeout = window.setTimeout(onError, LOAD_TIMEOUT_MS);
    document.head.appendChild(script);
    return () => {
      clearInterval(poll);
      clearTimeout(timeout);
      script.removeEventListener('error', onError);
      script.remove();
    };
  }, [playerRequested, apiReady, failed, attempt, failPlayback]);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => failPlayback(attempt), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status, attempt, currentTrack.id, failPlayback]);

  // Both raw YT instances and SDK wrappers can throw or return promises.
  // Check the actual iframe and instance again after every async boundary.
  const runPlayerCommand = useCallback(async (command: (player: YouTubePlayer) => unknown, player = playerRef.current) => {
    const generation = generationRef.current;
    try {
      if (!player || !mountedRef.current || playerRef.current !== player) return;
      const iframe = await player.getIframe();
      if (!mountedRef.current || generationRef.current !== generation || playerRef.current !== player ||
          !iframe?.isConnected || !playerHostRef.current?.contains(iframe)) return;
      return await command(player);
    } catch {
      // An iframe may be destroyed while an SDK promise is pending.
      return undefined;
    }
  }, []);

  // Update progress bar
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && playerReady) {
      interval = setInterval(async () => {
        // Only auto-update time if we aren't currently scrubbing it manually
        if (!isScrubbing.current && !document.hidden && playerRef.current) {
          const player = playerRef.current;
          const track = trackRef.current;
          const time = await runPlayerCommand(p => p.getCurrentTime(), player);
          if (mountedRef.current && playerRef.current === player && trackRef.current === track && typeof time === 'number') setCurrentTime(time);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playerReady, runPlayerCommand]);

  useEffect(() => {
    const player = playerRef.current;
    if (!playerReady || !player) return;
    let cancelled = false;
    void runPlayerCommand(p => {
      if (cancelled) return;
      return playIntent.current ? p.loadVideoById(currentTrack.id) : p.cueVideoById(currentTrack.id);
    }, player);
    return () => { cancelled = true; };
  }, [currentTrack.id, playerReady, runPlayerCommand]);

  const onReady = async (event: YouTubeEvent) => {
    if (attempt !== attemptRef.current || !mountedRef.current || failedRef.current) return;
    const player = event.target;
    const generation = generationRef.current;
    try {
      const iframe = await player.getIframe();
      if (!mountedRef.current || attempt !== attemptRef.current || generationRef.current !== generation || !iframe?.isConnected ||
          !playerHostRef.current?.contains(iframe)) return;
      if (failedRef.current) return;
      playerRef.current = player;
      setPlayerReady(player);
    } catch {
      // StrictMode may deliver readiness from the already-destroyed iframe.
    }
  };

  const onStateChange = (event: YouTubeEvent) => {
    if (attempt !== attemptRef.current || failedRef.current) return;
    void runPlayerCommand(async player => {
      // 1 = playing, 2 = paused, 0 = ended
      if (event.data === 1) {
        if (!playIntent.current) {
          await player.pauseVideo();
          return;
        }
        setStatus('playing');
        const track = trackRef.current;
        const length = await player.getDuration();
        if (mountedRef.current && playerRef.current === player && trackRef.current === track && typeof length === 'number') setDuration(length);
      } else if (event.data === 2) {
        // A delayed pause from the previous track must not cancel a new load.
        if (!playIntent.current || statusRef.current === 'playing') {
          playIntent.current = false;
          setStatus('paused');
        }
      } else if (event.data === 3 && playIntent.current) {
        setStatus('loading');
      } else if (event.data === 0) {
        if (!playIntent.current) return;
        changeTrack(1);
      }
    }, event.target);
  };

  const onError = async (event: YouTubeEvent) => {
    const generation = generationRef.current;
    try {
      const iframe = await event.target.getIframe();
      if (!mountedRef.current || attempt !== attemptRef.current || generation !== generationRef.current ||
          !iframe?.isConnected || !playerHostRef.current?.contains(iframe)) return;
      failPlayback(attempt);
    } catch {
      // Ignore errors from an instance that was destroyed before this callback.
    }
  };

  const retryPlayback = () => {
    failedRef.current = false;
    generationRef.current += 1;
    attemptRef.current += 1;
    playerRef.current = null;
    setPlayerReady(null);
    setApiReady(hasYouTubeApi());
    setAttempt(attemptRef.current);
    setCurrentTime(0);
    setDuration(0);
    playIntent.current = true;
    setStatus('loading');
    setCurrentView('nowPlaying');
    setPlayerRequested(true);
  };

  const handlePlayPause = () => {
    setCurrentView('nowPlaying');
    if (failed) { retryPlayback(); return; }
    playIntent.current = !playIntent.current;
    setStatus(playIntent.current ? 'loading' : 'paused');
    setPlayerRequested(true);
    if (!playerReady) return;
    void runPlayerCommand(player => playIntent.current ? player.playVideo() : player.pauseVideo());
  };

  const changeTrack = (direction: number) => {
    setCurrentTrackIndex((prev) => (prev + direction + PLAYLIST.length) % PLAYLIST.length);
    setCurrentTime(0);
    setDuration(0);
    if (playIntent.current) setStatus('loading');
  };

  const moveSelection = (direction: number) => {
    setSelectedIndex((prev) => (prev + direction + PLAYLIST.length) % PLAYLIST.length);
  };
  const handleNext = () => currentView === 'menu' ? moveSelection(1) : changeTrack(1);
  const handlePrev = () => currentView === 'menu' ? moveSelection(-1) : changeTrack(-1);

  const handleMenuClick = () => {
    setSelectedIndex(currentTrackIndex);
    setCurrentView('menu');
  };

  const handleSelectClick = () => {
    if (currentView === 'menu') {
      setCurrentView('nowPlaying');
      // playVideo() can be a no-op for a song that is already playing; no new
      // SDK event would arrive to clear a redundant loading timeout.
      if (selectedIndex === currentTrackIndex && statusRef.current === 'playing') return;
      setCurrentTrackIndex(selectedIndex);
      setStatus('loading');
      playIntent.current = true;
      setPlayerRequested(true);
      if (failed) {
        retryPlayback();
      } else if (playerReady && selectedIndex === currentTrackIndex) {
        void runPlayerCommand(player => player.playVideo());
      }
    } else {
      handlePlayPause();
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    if (currentView !== 'menu') return;
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') setSelectedIndex(0);
      else if (event.key === 'End') setSelectedIndex(PLAYLIST.length - 1);
      else moveSelection(event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.target === event.currentTarget.querySelector('[role="listbox"]') && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleSelectClick();
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingTime = duration ? duration - currentTime : 0;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Wheel Interaction Logic
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);

  const getAngle = (e: React.PointerEvent) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // If they click on the wheel itself (not a button), start dragging
    isDragging.current = true;
    lastAngle.current = getAngle(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    
    const currentAngle = getAngle(e);
    let delta = currentAngle - lastAngle.current;
    
    // Handle wrap-around
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (currentView === 'menu') {
      // Trigger scroll every 15 degrees in menu
      if (Math.abs(delta) > 15) {
        const direction = delta > 0 ? 1 : -1;
        setSelectedIndex((prev) => {
          let next = prev + direction;
          if (next >= PLAYLIST.length) next = 0;
          if (next < 0) next = PLAYLIST.length - 1;
          return next;
        });
        lastAngle.current = currentAngle;
      }
    } else if (currentView === 'nowPlaying') {
      // Scrub audio when in Now Playing
      if (Math.abs(delta) > 2) { // smaller delta for smoother scrubbing
        isScrubbing.current = true;
        
        // e.g., 360 degrees = 100 seconds of scrub
        const scrubAmount = (delta / 360) * 100;
        
        setCurrentTime((prev) => {
          let nextTime = prev + scrubAmount;
          if (nextTime < 0) nextTime = 0;
          if (nextTime > duration) nextTime = duration;
          return nextTime;
        });
        
        lastAngle.current = currentAngle;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    
    // If we were scrubbing, apply the new time to the youtube player
    if (isScrubbing.current && playerRef.current) void runPlayerCommand(player => player.seekTo(currentTime, true));
    isScrubbing.current = false;
  };

  return (
    <div onKeyDown={handleMenuKeyDown} className="w-[300px] h-[480px] bg-gradient-to-b from-[#fdfdfd] to-[#e6e6e6] rounded-[32px] p-6 shadow-[inset_0_1px_4px_rgba(255,255,255,1),_0_20px_40px_-10px_rgba(0,0,0,0.3)] flex flex-col items-center gap-8 relative border border-gray-300">
      
      {/* Hidden YouTube Player */}
      <div ref={playerHostRef} className="hidden">
        {playerRequested && apiReady && !failed && <YouTube
          key={attempt}
          videoId={PLAYLIST[0].id}
          opts={{
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={onError}
        />}
      </div>

      {/* Screen */}
      <div 
        className={`w-full h-[180px] bg-gradient-to-b from-[#9EAFC2] to-[#B5C5D8] rounded-md shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col font-sans border-2 border-[#1a2f4c]/40 ${currentView === 'nowPlaying' ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (currentView === 'nowPlaying') handlePlayPause();
        }}
      >
        
        {/* Scanlines overlay */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 z-20" 
          style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}
        />

        {/* Status Bar */}
        <div className="w-full h-6 bg-gradient-to-b from-white/40 to-white/10 flex items-center justify-between px-2 text-[11px] font-bold text-[#1a2f4c] border-b border-[#1a2f4c]/30 z-10 shrink-0 pointer-events-none">
          <span className="flex items-center gap-1 w-8">
            {isPlaying ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </span>
          <span className="text-center flex-1" role="status" aria-live="polite">{currentView === 'menu' && !failed ? 'Music' : ({ idle: 'Ready to play', loading: 'Loading music…', playing: 'Now Playing', paused: 'Paused', error: 'Music unavailable' })[status]}</span>
          <span className="w-8 flex justify-end">
            <div className="w-5 h-2.5 border border-[#1a2f4c] rounded-sm relative p-[1px]">
              <div className="w-[80%] h-full bg-[#1a2f4c] rounded-sm" />
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#1a2f4c] rounded-r-sm" />
            </div>
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full relative z-10 bg-[#B5C5D8] overflow-hidden">
          {currentView === 'menu' && !failed ? (
            // MENU VIEW
            <div role="listbox" aria-label="Music tracks" aria-activedescendant={`${menuId}-${selectedIndex}`} tabIndex={0} className="w-full h-full relative focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1a2f4c]">
              <div 
                className="w-full absolute left-0 top-0 transition-transform duration-150 ease-out flex flex-col py-1"
                style={{ transform: `translateY(-${Math.max(0, selectedIndex - 3) * 24}px)` }}
              >
                {PLAYLIST.map((track, idx) => (
                  <div 
                    key={track.id} 
                    id={`${menuId}-${idx}`}
                    role="option"
                    aria-selected={idx === selectedIndex}
                    aria-label={`${track.title} — ${track.artist}`}
                    className={`w-full h-6 px-2 shrink-0 text-[11px] font-bold flex justify-between items-center transition-colors ${idx === selectedIndex ? 'bg-gradient-to-b from-[#2a68c0] to-[#1a4a9c] text-white' : 'text-[#1a2f4c]'}`}
                  >
                    <span className="truncate flex-1 pr-2">{track.title}</span>
                    {idx === currentTrackIndex && (
                       <span className={`text-[10px] shrink-0 ${idx === selectedIndex ? 'text-white' : 'text-[#1a2f4c]/60'}`}>▶</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : failed ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 px-3 text-center text-[#1a2f4c]">
              <p role="alert" className="text-xs">Music couldn’t load. Check your connection and try again.</p>
              <button type="button" onClick={(event) => { event.stopPropagation(); retryPlayback(); }} className="min-h-11 px-4 rounded-full bg-[#1a2f4c] text-white text-xs">Retry music</button>
            </div>
          ) : (
            // NOW PLAYING VIEW
            <div className="w-full h-full flex flex-col p-3 text-center text-[#1a2f4c] pointer-events-none">
              <p className="text-[10px] font-bold text-left mb-2">{currentTrackIndex + 1} of {PLAYLIST.length}</p>
              
              <div className="flex-1 flex flex-col items-center justify-center mt-[-10px]">
                <h3 className="font-bold text-sm tracking-tight px-2 leading-tight">{currentTrack.title}</h3>
                <p className="text-xs mt-1 font-medium">{currentTrack.artist}</p>
              </div>

              {/* Progress */}
              <div className="w-full flex flex-col gap-1.5 mt-auto pb-1">
                <div className="w-full h-2.5 bg-gradient-to-b from-[#8E9EB0] to-[#A3B3C4] rounded-full border border-[#1a2f4c]/40 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-b from-[#4A6482] to-[#2E4259] rounded-full" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(remainingTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click Wheel Area */}
      <div 
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-[200px] h-[200px] bg-gradient-to-b from-[#e0e0e0] to-[#d4d4d4] rounded-full shadow-[inset_0_-1px_3px_rgba(0,0,0,0.1),_inset_0_1px_4px_rgba(255,255,255,0.9),_0_2px_4px_rgba(0,0,0,0.15)] relative flex items-center justify-center mt-2 group touch-none select-none cursor-pointer"
      >
        
        {/* Top MENU */}
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleMenuClick}
          className="absolute top-0 min-h-11 min-w-16 font-bold text-[#555] text-[11px] tracking-widest hover:text-[#333] active:text-[#111] transition-colors uppercase z-10"
        >
          Menu
        </button>

        {/* Left PREV */}
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handlePrev}
          aria-label="Previous track"
          className="absolute left-1 w-11 h-11 flex items-center justify-center text-[#555] hover:text-[#333] active:text-[#111] transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Right NEXT */}
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleNext}
          aria-label="Next track"
          className="absolute right-1 w-11 h-11 flex items-center justify-center text-[#555] hover:text-[#333] active:text-[#111] transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        {/* Bottom PLAY/PAUSE */}
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handlePlayPause}
          aria-label={status === 'loading' ? 'Cancel loading' : isPlaying ? 'Pause' : 'Play'}
          className="absolute bottom-0 min-w-11 h-11 text-[#555] hover:text-[#333] active:text-[#111] transition-colors flex items-center justify-center z-10 p-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        {/* Center Select Button */}
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleSelectClick}
          aria-label={currentView === 'menu' ? 'Select track' : status === 'loading' ? 'Cancel loading selected track' : isPlaying ? 'Pause selected track' : 'Play selected track'}
          className="w-[74px] h-[74px] bg-gradient-to-b from-[#f4f4f4] to-[#ebebeb] rounded-full shadow-[inset_0_1px_3px_rgba(255,255,255,1),_0_2px_6px_rgba(0,0,0,0.2)] active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.1),_0_1px_2px_rgba(0,0,0,0.1)] border border-white/50 transition-shadow z-20"
        />
      </div>
    </div>
  );
};
