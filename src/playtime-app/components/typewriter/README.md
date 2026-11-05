# Vintage typewriter components

Two modes on one ink engine. Lives in the Playtime app (`src/playtime-app`), shown in the "Typewriter" section after Shiva-Shakti.

```tsx
<TypewriterEditor initialText="" placeholder="Dear Ankit," paperTone="warm" inkColor="#403B36"
  fontSize={24} inkVariation={0.75} paperGrain={0.45} characterImperfection={0.6}
  soundEnabled={false} seed={42} onChange={(text) => {}} />

<TypewriterDisplay text="A little story, written one letter at a time."
  animateOnView typingSpeed={75} showCaret seed={42} />
```

Shared props: `font` (`'special-elite'` default, or `'courier-prime'`), `paperTone` (`warm | ivory | aged`), `inkColor`, `fontSize`
(scaled down on narrow sheets), `inkVariation`, `paperGrain`, `characterImperfection` (all 0..1), `seed`, `minLines`.
Editor only: `value`/`onChange` (controlled), `initialText`, `maxLength`, `placeholder`, `showControls`, `soundEnabled`.
Display only: `animateOnView`, `typingSpeed` (ms/char, with punctuation pauses), `showCaret`, `startDelay`, `onComplete`, `sheet`.

## How it works
- **Editing**: a native, transparent `<textarea>` owns input, selection, IME, undo/redo and paste. It is set in Courier Prime at the
  size whose advance equals the printed cell width, so its wrapping, clicks and selection land on the same cells as the ink.
- **Layout** (`lib/typewriter/textLayout.ts`, `caretPosition.ts`): monospaced greedy wrap; every character keeps its text index.
- **Ink** (`lib/typewriter/inkRenderer.ts`, `glyphMasks.ts`): each glyph is rasterised to an alpha mask, then given a deterministic
  impression (strength class, pressure gradient, dropout clipped to the glyph, edge roughness, over-inking, sub-pixel jitter and
  rotation). Variants depend only on `seed` + character index, so appending text never changes printed characters. Bitmaps are cached;
  the canvas redraws only when text, selection or size change. The sheet's grain also knocks tiny holes in the ink, and the layer
  is composited with `multiply`.
- **Paper** (`lib/typewriter/paperTexture.ts`, `VintagePaper.tsx`): ivory base, low-frequency aging (smoothly upscaled, never tiles),
  shared grain tile, seeded fibres and specks. Painted once per size (height snaps in 240px steps while typing).
- **Sound** (`hooks/useTypewriterSound.ts`): synthesised with Web Audio, off by default, created only after the visitor turns it on.
- **Accessibility**: canvases are `aria-hidden`; the textarea (editor) or a screen-reader-only copy (display) carries the text.
  Visible focus ring, `prefers-reduced-motion` prints the display text at once and stops the caret blinking, and if Canvas is
  unavailable the text falls back to a visible textarea / paragraph.

## Fonts
Served locally from `public/assets/fonts/typewriter/` (Courier Prime, SIL OFL; Special Elite, Apache-2.0). Special Elite has uneven
glyph widths, so it is set on a fixed pitch (average lowercase width) with each glyph centred in its cell, like a typebar strike.
