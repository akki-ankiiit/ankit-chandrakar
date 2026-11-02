import presentationStyles from '../styles/thanq-presentation.css?inline';

const number = (index) => String(index + 1).padStart(2, '0');

function slideTitle(frame) {
  const heading = frame.querySelector('.h1, .h1s, .display');
  if (!heading) return frame.getAttribute('aria-label') || frame.id;
  const copy = heading.cloneNode(true);
  copy.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

// Adapt the same-origin source after load; never rewrite the original HTML/assets.
export default function prepareThanQPresentation(iframe) {
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  const deck = doc?.querySelector('.deck');
  const frames = [...(deck?.querySelectorAll('.frame') || [])];
  if (!win || !frames.length) return;

  const root = doc.documentElement;
  const controller = new win.AbortController();
  const listen = (target, type, listener, options = {}) => {
    target.addEventListener(type, listener, { ...options, signal: controller.signal });
  };
  const style = doc.createElement('style');
  style.id = 'thanq-presentation-style';
  style.textContent = presentationStyles;
  doc.head.append(style);
  root.classList.add('tq-presentation');
  deck.setAttribute('aria-label', 'ThanQ brand guidelines slides');

  const toolbar = doc.createElement('nav');
  toolbar.id = 'tq-toolbar';
  toolbar.setAttribute('aria-label', 'Presentation controls');
  const makeButton = (label, id, parent = toolbar) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = 'tq-tool-button';
    button.textContent = label;
    parent.append(button);
    return button;
  };
  const center = doc.createElement('div');
  center.className = 'tq-toolbar-center';
  toolbar.append(center);
  const previous = makeButton('←', 'tq-previous', center);
  previous.classList.add('tq-arrow');
  previous.setAttribute('aria-label', 'Previous slide');
  const counter = doc.createElement('span');
  counter.id = 'tq-counter';
  counter.setAttribute('role', 'status');
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-atomic', 'true');
  center.append(counter);
  const next = makeButton('→', 'tq-next', center);
  next.classList.add('tq-arrow');
  next.setAttribute('aria-label', 'Next slide');
  const right = doc.createElement('div');
  right.className = 'tq-toolbar-right';
  toolbar.append(right);
  const contents = makeButton('Contents', 'tq-contents', right);
  contents.setAttribute('aria-haspopup', 'dialog');
  contents.setAttribute('aria-controls', 'tq-slide-index');
  const allSlides = makeButton('All slides', 'tq-all-slides', right);
  const fullscreen = makeButton('Fullscreen', 'tq-fullscreen', right);
  fullscreen.setAttribute('aria-pressed', 'false');

  const dialog = doc.createElement('dialog');
  dialog.id = 'tq-slide-index';
  dialog.setAttribute('aria-labelledby', 'tq-index-title');
  const head = doc.createElement('div');
  head.className = 'tq-index-head';
  const title = doc.createElement('h2');
  title.id = 'tq-index-title';
  title.textContent = 'Contents';
  head.append(title);
  const close = makeButton('Close', 'tq-close-index', head);
  dialog.append(head);
  const indexGrid = doc.createElement('div');
  indexGrid.className = 'tq-index-grid';
  dialog.append(indexGrid);
  doc.body.append(toolbar, dialog);

  let current = 0;
  let reading = false;
  let disposed = false;
  let opener = contents;
  let scrollFrame = null;
  let programmedScrollTop = null;
  const parseHash = () => {
    const match = win.location.hash.match(/^#slide-(\d+)$/);
    return match ? Math.max(0, Math.min(frames.length - 1, Number(match[1]) - 1)) : null;
  };
  current = parseHash() ?? 0;
  const titles = frames.map(slideTitle);
  const indexButtons = frames.map((frame, index) => {
    frame.setAttribute('aria-label', `Slide ${index + 1}: ${titles[index]}`);
    const button = makeButton('', `tq-index-${index + 1}`, indexGrid);
    button.className = 'tq-index-item';
    const badge = doc.createElement('span');
    badge.textContent = number(index);
    button.append(badge, doc.createTextNode(titles[index]));
    listen(button, 'click', () => {
      current = index;
      setReading(false);
      dialog.close();
    });
    return button;
  });

  function fit() {
    if (disposed) return;
    const styles = win.getComputedStyle(deck);
    const contentWidth = Math.max(0, deck.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight));
    const contentHeight = Math.max(0, deck.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom));
    root.style.setProperty('--tq-slide-width', `${Math.min(1440, contentWidth, contentHeight * 16 / 9)}px`);
    // The source observer watches only .deck. Mode changes can resize frames
    // without resizing that container, so explicitly fit every visible canvas.
    frames.forEach((frame) => {
      const width = frame.getBoundingClientRect().width;
      if (width) frame.style.setProperty('--k', String(width / 1920));
    });
  }

  function show(index, updateHash = true, scroll = true) {
    current = Math.max(0, Math.min(frames.length - 1, index));
    frames.forEach((frame, i) => {
      const hidden = !reading && i !== current;
      frame.classList.toggle('tq-current', i === current);
      frame.inert = hidden;
      frame.setAttribute('aria-hidden', String(hidden));
      if (i === current) indexButtons[i].setAttribute('aria-current', 'page');
      else indexButtons[i].removeAttribute('aria-current');
    });
    counter.textContent = `${number(current)} / ${frames.length}`;
    counter.setAttribute('aria-label', `Slide ${current + 1} of ${frames.length}: ${titles[current]}`);
    previous.disabled = current === 0;
    next.disabled = current === frames.length - 1;
    doc.title = `${number(current)} · ${titles[current]} — ThanQ`;
    if (updateHash) win.history.replaceState(win.history.state, '', `#slide-${current + 1}`);
    fit();
    if (reading && scroll) {
      cancelScrollSync();
      const target = frames[current].getBoundingClientRect();
      const bounds = deck.getBoundingClientRect();
      const styles = win.getComputedStyle(deck);
      const paddingTop = parseFloat(styles.paddingTop);
      const contentHeight = Math.max(0, deck.clientHeight - paddingTop - parseFloat(styles.paddingBottom));
      deck.scrollTo({
        top: deck.scrollTop + target.top - bounds.top - deck.clientTop - paddingTop + (target.height - contentHeight) / 2,
        behavior: 'instant',
      });
      // Keep explicit navigation (including the right slide in a row) selected
      // until the user actually scrolls away from this programmatic position.
      programmedScrollTop = deck.scrollTop;
    }
  }

  function cancelScrollSync() {
    if (scrollFrame !== null) win.cancelAnimationFrame(scrollFrame);
    scrollFrame = null;
    programmedScrollTop = null;
  }

  function syncVisibleSlide() {
    scrollFrame = null;
    if (disposed || !reading) return;
    if (programmedScrollTop !== null && Math.abs(deck.scrollTop - programmedScrollTop) < 0.5) return;
    programmedScrollTop = null;

    const bounds = deck.getBoundingClientRect();
    const top = bounds.top + deck.clientTop;
    const bottom = top + deck.clientHeight;
    const anchor = top + deck.clientHeight * 0.4;
    let nearest = current;
    let distance = Infinity;
    frames.forEach((frame, index) => {
      const rect = frame.getBoundingClientRect();
      if (rect.bottom <= top || rect.top >= bottom) return;
      const candidate = Math.abs((rect.top + rect.bottom) / 2 - anchor);
      // DOM order is left-to-right: strict comparison keeps the left slide
      // when both frames in a two-column row are equally near the anchor.
      if (candidate < distance) {
        distance = candidate;
        nearest = index;
      }
    });
    if (nearest !== current) show(nearest, true, false);
  }

  function setReading(value) {
    cancelScrollSync();
    reading = value;
    root.classList.toggle('tq-reading', reading);
    allSlides.textContent = reading ? 'Slideshow' : 'All slides';
    allSlides.setAttribute('aria-pressed', String(reading));
    show(current);
    if (!reading) deck.scrollTo(0, 0);
  }

  listen(deck, 'scroll', () => {
    if (reading && scrollFrame === null) scrollFrame = win.requestAnimationFrame(syncVisibleSlide);
  }, { passive: true });
  listen(previous, 'click', () => show(current - 1));
  listen(next, 'click', () => show(current + 1));
  listen(allSlides, 'click', () => setReading(!reading));
  listen(contents, 'click', () => {
    opener = contents;
    dialog.showModal();
    indexButtons[current].focus({ preventScroll: true });
    indexButtons[current].scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
  listen(close, 'click', () => dialog.close());
  listen(dialog, 'close', () => opener?.focus({ preventScroll: true }));
  listen(dialog, 'click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  listen(fullscreen, 'click', async () => {
    try {
      if (doc.fullscreenElement) await doc.exitFullscreen();
      else await root.requestFullscreen();
    } catch {
      if (!disposed) counter.setAttribute('aria-label', 'Fullscreen is unavailable. Presentation controls remain available.');
    }
  });
  listen(doc, 'fullscreenchange', () => {
    fullscreen.textContent = doc.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
    fullscreen.setAttribute('aria-pressed', String(Boolean(doc.fullscreenElement)));
    fit();
  });
  listen(win, 'hashchange', () => {
    const index = parseHash();
    if (index !== null) show(index, false);
  });
  listen(doc, 'keydown', (event) => {
    const key = event.key;
    const sourceKey = ['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', ' '].includes(key);
    const target = event.target;
    const editing = target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
    const interactive = target.closest('button, a, summary, [role="button"]');
    if (dialog.open || editing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (interactive && (key === ' ' || key.toLowerCase() === 'p'))) {
      // Keep native activation/scroll/shortcuts, but never let the source's
      // anonymous document listener navigate hidden frames underneath them.
      if (sourceKey) event.stopImmediatePropagation();
      return;
    }
    let action;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(key) || (key === ' ' && target === doc.body)) action = () => show(current + 1);
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key)) action = () => show(current - 1);
    else if (key === 'Home') action = () => show(0);
    else if (key === 'End') action = () => show(frames.length - 1);
    else if (key.toLowerCase() === 'p') action = () => setReading(!reading);
    if (!action) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    action();
  }, { capture: true });

  const observer = new win.ResizeObserver(fit);
  observer.observe(deck);
  frames.forEach((frame) => observer.observe(frame));
  listen(win, 'resize', fit);
  setReading(false);
  doc.fonts.ready.then(() => { if (!disposed) fit(); });

  return () => {
    disposed = true;
    cancelScrollSync();
    controller.abort();
    observer.disconnect();
    toolbar.remove();
    dialog.remove();
    style.remove();
    root.classList.remove('tq-presentation', 'tq-reading');
    root.style.removeProperty('--tq-slide-width');
    frames.forEach((frame) => {
      frame.inert = false;
      frame.removeAttribute('aria-hidden');
      frame.classList.remove('tq-current');
    });
  };
}
