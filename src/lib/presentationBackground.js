export function applyPresentationBackground(event, color) {
  const document = event.currentTarget.contentDocument;
  if (!document || document.getElementById('presentation-background')) return;

  const style = document.createElement('style');
  style.id = 'presentation-background';
  style.textContent = `html, body, body.reading { background: ${color}; }`;
  document.head.append(style);
}
