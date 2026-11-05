import type { AudioSettings } from '../../hooks/useTypewriterAudio';

interface TypewriterSoundControlsProps {
  settings: AudioSettings;
  onVolume: (volume: number) => void;
  onBell: (bell: boolean) => void;
}

/** Volume and end-of-line bell. The on/off switch lives in TypewriterControls. */
export function TypewriterSoundControls({ settings, onVolume, onBell }: TypewriterSoundControlsProps) {
  return (
    <div className="tw-sound" role="group" aria-label="Typewriter sound settings">
      <label className="tw-sound-volume">
        <span>Volume</span>
        <input
          type="range" min={0} max={100} step={1}
          value={Math.round(settings.volume * 100)}
          onChange={(e) => onVolume(Number(e.target.value) / 100)}
          disabled={!settings.enabled}
          aria-label="Typewriter sound volume"
        />
      </label>
      <label className="tw-sound-bell">
        <input type="checkbox" checked={settings.bell} onChange={(e) => onBell(e.target.checked)} disabled={!settings.enabled} />
        <span>End-of-line bell</span>
      </label>
    </div>
  );
}
