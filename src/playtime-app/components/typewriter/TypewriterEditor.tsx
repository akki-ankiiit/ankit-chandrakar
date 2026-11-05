import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { VintagePaper, type PaperToneName } from './VintagePaper';
import { PaperFeed, type PaperFeedHandle } from './PaperFeed';
import { MechanicalCarriage } from './MechanicalRail';
import { TypewriterViewport } from './TypewriterViewport';
import type { InputAction } from '../../hooks/useMechanicalCarriage';
import { TypewriterCanvas } from './TypewriterCanvas';
import { TypewriterControls } from './TypewriterControls';
import { useClientWidth, useTypewriterGeometry } from '../../hooks/useTypewriter';
import { useTypewriterAudio } from '../../hooks/useTypewriterAudio';
import { TypewriterSoundControls } from './TypewriterSoundControls';
import { FONT_STACKS, type TypewriterFont } from '../../lib/typewriter/fonts';
import { indexToCell } from '../../lib/typewriter/caretPosition';
import { DEFAULT_INK, type InkOptions } from '../../lib/typewriter/inkRenderer';
import { makePalette } from '../../lib/typewriter/palette';

const PRINTABLE = /^[^\u0000-\u001f\u007f]$/;

function classifyInput(event: InputEvent): InputAction {
  const type = event.inputType;
  if (event.isComposing || type.startsWith('insertComposition') || type === 'insertFromComposition') return 'composition';
  if (type === 'insertLineBreak' || type === 'insertParagraph') return 'enter';
  if (type.startsWith('delete')) return 'erase';
  if (type === 'insertText' && PRINTABLE.test(event.data ?? '')) return 'key';
  if (type.startsWith('insert')) return 'paste';
  return 'nav';
}

export interface TypewriterEditorProps {
  initialText?: string;
  /** Controlled value. When given, `onChange` must update it. */
  value?: string;
  onChange?: (text: string) => void;
  paperTone?: PaperToneName;
  inkColor?: string;
  fontSize?: number;
  inkVariation?: number;
  paperGrain?: number;
  characterImperfection?: number;
  seed?: number;
  font?: TypewriterFont;
  minLines?: number;
  maxLength?: number;
  placeholder?: string;
  ariaLabel?: string;
  showControls?: boolean;
  /** Subtle curved-paper shading. Visual only; text positions and cursor mapping are unchanged. */
  curvedPaper?: boolean;
  className?: string;
}

/** Mode A: write directly onto the sheet. A native <textarea> owns editing; the canvas prints it. */
export function TypewriterEditor({
  initialText = '', value, onChange, paperTone = 'warm', inkColor = DEFAULT_INK.primary, fontSize = 24,
  inkVariation = 0.75, paperGrain = 0.35, characterImperfection = 0.6, seed = 42,
  font = 'special-elite', minLines = 9, maxLength = 10000, placeholder = 'Dear visitor,', ariaLabel = 'Write a letter on the typewriter',
  showControls = true, curvedPaper = false, className = '',
}: TypewriterEditorProps) {
  const [inner, setInner] = useState(initialText);
  const text = value ?? inner;
  const [sel, setSel] = useState({ start: initialText.length, end: initialText.length });
  const [focused, setFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<PaperFeedHandle>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  /** What the next text change was. Read and reset by the carriage hook. */
  const actionRef = useRef<InputAction>('nav');
  const [scrollRef, width] = useClientWidth<HTMLDivElement>();
  const audio = useTypewriterAudio();
  const soundOn = audio.settings.enabled;
  const g = useTypewriterGeometry({ text, width, font, fontSize, minLines });
  const options: InkOptions = useMemo(() => ({ palette: makePalette(inkColor), inkVariation, characterImperfection, seed }), [inkColor, inkVariation, characterImperfection, seed]);

  const syncSelection = useCallback(() => {
    const el = area.current;
    if (!el) return;
    setSel((prev) => (prev.start === el.selectionStart && prev.end === el.selectionEnd ? prev : { start: el.selectionStart, end: el.selectionEnd }));
  }, []);

  const update = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    if (value === undefined) setInner(next);
    onChange?.(next);
    syncSelection();
  };

  const onKeyDown = (_event: KeyboardEvent<HTMLTextAreaElement>) => {
    actionRef.current = 'nav';
    requestAnimationFrame(syncSelection);
  };

  // Keep an accidental native scroll from ever shifting the text away from the printed ink.
  const pin = () => { if (area.current) { area.current.scrollTop = 0; area.current.scrollLeft = 0; } };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch {
      area.current?.select(); document.execCommand('copy');
    }
    setCopied(true);
  };
  useEffect(() => { if (!copied) return undefined; const t = setTimeout(() => setCopied(false), 1600); return () => clearTimeout(t); }, [copied]);
  const clear = () => {
    if (value === undefined) setInner('');
    onChange?.('');
    setSel({ start: 0, end: 0 });
    area.current?.focus({ preventScroll: true });
  };

  const { metrics, layout, padX, padY, paperHeight, cols } = g;
  const caret = metrics && indexToCell(layout, sel.end);
  // Painted ink window: the scroll position plus a few lines either side. Quantised to lines, so it changes rarely.
  const [band, setBand] = useState({ top: 0, height: 0 });
  const lineH = metrics?.lineH ?? 0;
  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (!box || !lineH) return undefined;
    const pad = lineH * 3;
    const update = () => {
      const top = Math.max(0, Math.floor((box.scrollTop - pad) / lineH) * lineH);
      const height = box.clientHeight + pad * 2 + lineH;
      setBand((prev) => (prev.top === top && prev.height === height ? prev : { top, height }));
    };
    update();
    box.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => { box.removeEventListener('scroll', update); observer.disconnect(); };
  }, [scrollRef, lineH]);
  // Keep the active line in view as the writer types, or after a move; never during a feed (its end calls this).
  useLayoutEffect(() => { feedRef.current?.followCaret(); }, [text, sel.end]);
  const showFallback = fallback || (!metrics && g.ready);
  const textHeight = paperHeight - padY * 2;
  const fontFamily = FONT_STACKS[font];
  // Native beforeinput fires for typing, Enter, deletes, paste and IME, including on mobile keyboards without keydown.
  useEffect(() => {
    const el = area.current;
    if (!el) return undefined;
    const onBefore = (event: Event) => { actionRef.current = classifyInput(event as InputEvent); };
    el.addEventListener('beforeinput', onBefore);
    return () => el.removeEventListener('beforeinput', onBefore);
  }, []);

  return (
    <div className={`tw-editor ${className}`} style={{ ['--tw-ink' as string]: inkColor }}>
      <TypewriterViewport
        scrollRef={scrollRef}
        onResize={() => feedRef.current?.followCaret()}
        carriage={
          <MechanicalCarriage
        enabled={Boolean(metrics) && !showFallback}
        text={text}
        caretIndex={sel.end}
        layout={layout}
        cellW={metrics?.cellW ?? 0}
        lineH={metrics?.lineH ?? 0}
        padX={padX}
        width={width}
        fontSize={g.fontSize}
        actionRef={actionRef}
        onLineFeed={() => feedRef.current?.feedLine()}
        onNavigate={() => feedRef.current?.followCaret()}
        onSound={audio.play}
      />
        }
      >
      <VintagePaper tone={paperTone} grain={paperGrain} seed={seed} style={{ height: paperHeight || 320 }} band={band.height ? band : undefined}>
        <PaperFeed ref={feedRef} lineHeight={metrics?.lineH ?? 0} scrollRef={scrollRef} caretRef={caretRef} curved={curvedPaper}>
        {metrics && !fallback && (
          <TypewriterCanvas
            width={width} height={paperHeight} layout={layout} metrics={metrics} options={options}
            originX={padX} originY={padY} grain={paperGrain} band={band.height ? band : undefined}
            selection={focused || sel.start !== sel.end ? { from: sel.start, to: sel.end } : undefined}
            onUnsupported={() => setFallback(true)}
          />
        )}
        {caret && !showFallback && (
          <span
            ref={caretRef}
            className={`tw-caret${focused ? ' is-live' : ''}`}
            aria-hidden="true"
            style={{ left: padX + caret.col * metrics!.cellW, top: padY + caret.line * metrics!.lineH + metrics!.lineH * 0.12, height: metrics!.lineH * 0.76 }}
          />
        )}
        <textarea
          ref={area}
          className={`tw-input${showFallback ? ' tw-fallback' : ''}`}
          value={text}
          onChange={update}
          onKeyDown={onKeyDown}
          onKeyUp={syncSelection}
          onMouseUp={syncSelection}
          onSelect={syncSelection}
          onInput={syncSelection}
          onScroll={pin}
          onFocus={() => { setFocused(true); syncSelection(); }}
          onBlur={() => setFocused(false)}
          onCompositionEnd={syncSelection}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={ariaLabel}
          spellCheck={false}
          autoCapitalize="sentences"
          style={{
            left: padX, top: padY, width: cols * (metrics?.cellW ?? 14), height: textHeight + (metrics?.lineH ?? 24),
            fontFamily: showFallback ? fontFamily : FONT_STACKS['courier-prime'],
            fontSize: showFallback || !metrics ? g.fontSize : metrics.inputFontSize,
            lineHeight: `${metrics?.lineH ?? g.fontSize * 1.45}px`,
          }}
        />
        </PaperFeed>
      </VintagePaper>
      </TypewriterViewport>
      {showControls && (
        <TypewriterControls soundOn={soundOn} copied={copied} canClear={text.length > 0} onToggleSound={() => audio.setEnabled(!soundOn)} onCopy={copy} onClear={clear} />
      )}
      {showControls && <TypewriterSoundControls settings={audio.settings} onVolume={audio.setVolume} onBell={audio.setBell} />}
    </div>
  );
}
