import type { TextLayout } from './textLayout';

export interface CaretCell { line: number; col: number }

/** Map a text index to a (line, column) cell. Index may equal text.length (caret at the end). */
export function indexToCell(layout: TextLayout, index: number): CaretCell {
  const { lines, cols } = layout;
  for (let i = 0; i < lines.length; i += 1) {
    const { start, end } = lines[i];
    const next = lines[i + 1];
    // An index at a wrap boundary belongs to the next line; one at a paragraph end stays on this line.
    const lastOfParagraph = !next || next.start > end;
    if (index < end || (lastOfParagraph && index <= end)) {
      return { line: i, col: Math.min(index - start, cols) };
    }
  }
  const last = lines.length - 1;
  return { line: Math.max(0, last), col: Math.min(index - (lines[last]?.start ?? 0), cols) };
}

/** Per-line [fromCol, toCol) ranges covered by a selection. */
export function selectionRanges(layout: TextLayout, from: number, to: number) {
  const ranges: { line: number; from: number; to: number }[] = [];
  if (to <= from) return ranges;
  layout.lines.forEach((line, i) => {
    const a = Math.max(from, line.start);
    const b = Math.min(to, line.end);
    if (b > a) ranges.push({ line: i, from: a - line.start, to: b - line.start });
  });
  return ranges;
}
