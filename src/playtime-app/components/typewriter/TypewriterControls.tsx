interface TypewriterControlsProps {
  soundOn: boolean;
  copied: boolean;
  canClear: boolean;
  onToggleSound: () => void;
  onCopy: () => void;
  onClear: () => void;
}

/** Quiet, typewriter-set controls that live outside the paper. */
export function TypewriterControls({ soundOn, copied, canClear, onToggleSound, onCopy, onClear }: TypewriterControlsProps) {
  return (
    <div className="tw-controls" role="group" aria-label="Typewriter controls">
      <button type="button" onClick={onToggleSound} aria-pressed={soundOn}>Keys: {soundOn ? 'on' : 'off'}</button>
      <button type="button" onClick={onCopy} disabled={!canClear}>{copied ? 'Copied' : 'Copy text'}</button>
      <button type="button" onClick={onClear} disabled={!canClear}>Clear page</button>
      <span className="tw-sr-only" role="status" aria-live="polite">{copied ? 'Text copied to clipboard' : ''}</span>
    </div>
  );
}
