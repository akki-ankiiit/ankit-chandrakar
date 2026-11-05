/**
 * Monospaced greedy word-wrap. Every character of the source text (including "\n") keeps its
 * original index, so layout positions, the native <textarea> selection and the canvas agree.
 */
export interface LayoutLine { start: number; end: number }
export interface LayoutChar { ch: string; index: number; line: number; col: number }
export interface TextLayout { cols: number; lines: LayoutLine[]; chars: LayoutChar[] }

export function layoutText(text: string, cols: number): TextLayout {
  const width = Math.max(1, Math.floor(cols));
  const lines: LayoutLine[] = [];
  const chars: LayoutChar[] = [];
  let offset = 0;
  const paragraphs = text.split('\n');
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const length = paragraph.length;
    let pos = 0;
    if (length === 0) {
      lines.push({ start: offset, end: offset });
    }
    while (pos < length) {
      let end: number;
      if (length - pos <= width) {
        end = length;
      } else {
        // Break after the last space that still fits (a space may hang one past the edge).
        const space = paragraph.lastIndexOf(' ', pos + width);
        end = space > pos ? space + 1 : pos + width;
      }
      lines.push({ start: offset + pos, end: offset + end });
      pos = end;
    }
    offset += length + (paragraphIndex < paragraphs.length - 1 ? 1 : 0);
  });
  lines.forEach((line, lineIndex) => {
    for (let index = line.start; index < line.end; index += 1) {
      const ch = text[index];
      if (ch === '\n') continue;
      chars.push({ ch, index, line: lineIndex, col: index - line.start });
    }
  });
  return { cols: width, lines, chars };
}
