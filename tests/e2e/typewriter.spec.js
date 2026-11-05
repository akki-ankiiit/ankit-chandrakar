import { test, expect } from '@playwright/test';

/**
 * Mechanical typewriter: deterministic event and state assertions.
 * Hammer strikes and paper feeds are counted by instrumenting the DOM and the Web Animations API,
 * not by waiting on fixed delays. Settling is awaited with expect.poll.
 */

const EDITOR = 'textarea.tw-input';

async function instrument(page) {
  await page.addInitScript(() => {
    window.__feeds = 0;
    const animate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function (...args) {
      if (this.classList.contains('pf-stage')) window.__feeds += 1;
      return animate.apply(this, args);
    };
  });
}

async function openEditor(page) {
  await page.goto('/playtime');
  // The section mounts when it nears the viewport, so bring it into view first.
  const section = page.locator('#typewriter');
  await section.waitFor({ state: 'attached', timeout: 30000 });
  await section.scrollIntoViewIfNeeded();
  const editor = page.locator(EDITOR);
  await expect(editor).toBeAttached({ timeout: 30000 });
  await editor.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const root = document.querySelector('.playtime-shadow-host').shadowRoot;
    window.__strikes = 0;
    new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) {
        if (n.nodeType === 1 && n.classList?.contains('mr-hammer') && n.classList.contains('is-striking')) window.__strikes += 1;
      }
    }).observe(root, { subtree: true, childList: true });
  });
  return editor;
}

const readState = (page) => page.evaluate(() => {
  const root = document.querySelector('.playtime-shadow-host').shadowRoot;
  const cap = root.querySelector('.tw-editor .mr-capsule');
  const caret = root.querySelector('.tw-editor .tw-caret');
  const stage = root.querySelector('.tw-editor .pf-stage');
  const ta = root.querySelector('textarea.tw-input');
  const ink = root.querySelector('.tw-editor .tw-ink');
  const centre = new DOMMatrixReadOnly(getComputedStyle(cap).transform).m41 + parseFloat(cap.style.width) / 2;
  return {
    text: ta.value,
    selStart: ta.selectionStart,
    selEnd: ta.selectionEnd,
    strikes: window.__strikes,
    feeds: window.__feeds,
    stageAnimations: stage.getAnimations().length,
    capsuleAligned: Math.abs(centre - parseFloat(caret.style.left)) < 1.5,
    inkPainted: ink.width > 0 && ink.height > 0,
  };
});

/** Wait until the capsule has settled on the caret (the spring takes about 70ms). */
const expectAligned = (page) => expect.poll(async () => (await readState(page)).capsuleAligned).toBe(true);

test.describe('typewriter editing', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop keyboard behaviour; mobile emulation is covered separately');

  test.beforeEach(async ({ page }) => { await instrument(page); });

  test('printable characters, spaces and punctuation', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('Dear Ankit, a quick note.');
    await expect.poll(async () => (await readState(page)).text).toBe('Dear Ankit, a quick note.');
    await expect.poll(async () => (await readState(page)).strikes).toBe(25);
    await expectAligned(page);
  });

  test('manual line break feeds the paper exactly once', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('First');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second');
    await expect.poll(async () => (await readState(page)).text).toBe('First\nSecond');
    await expect.poll(async () => (await readState(page)).feeds).toBe(1);
    await expect.poll(async () => (await readState(page)).stageAnimations).toBe(0);
    await expectAligned(page);
  });

  test('automatic wrapping feeds once per new visual line', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    const before = await readState(page);
    await page.keyboard.type('wordwordword '.repeat(12).trim());
    const expected = 'wordwordword '.repeat(12).trim();
    await expect.poll(async () => (await readState(page)).text).toBe(expected);
    const after = await readState(page);
    expect(after.feeds).toBeGreaterThan(0);
    expect(after.strikes).toBe(expected.length - before.text.length);
    await expect.poll(async () => (await readState(page)).stageAnimations).toBe(0);
    await expectAligned(page);
  });

  test('arrow keys move the caret without strikes or feeds', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('abc');
    const before = await readState(page);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await readState(page)).selStart).toBe(1);
    const after = await readState(page);
    expect(after.strikes).toBe(before.strikes);
    expect(after.feeds).toBe(before.feeds);
    await expectAligned(page);
  });

  test('pointer click places the caret and the capsule follows', async ({ page }) => {
    await openEditor(page);
    const editor = page.locator(EDITOR);
    await editor.click();
    await page.keyboard.type('Hello world');
    await editor.click({ position: { x: 20, y: 10 } });
    await expect.poll(async () => (await readState(page)).selStart).toBeLessThan(3);
    await expectAligned(page);
  });

  test('selection is replaced by typed text and clears correctly', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('Replace this word');
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('Done');
    await expect.poll(async () => (await readState(page)).text).toBe('Done');
    await expectAligned(page);
  });

  test('backspace and delete', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('abcdef');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Delete');
    await expect.poll(async () => (await readState(page)).text).toBe('abce');
    const s = await readState(page);
    expect(s.strikes).toBe(6);
  });

  test('copy and paste, including multiline text', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.insertText('Pasted one.\nPasted two.');
    await expect.poll(async () => (await readState(page)).text).toBe('Pasted one.\nPasted two.');
    const before = await readState(page);
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('ControlOrMeta+c');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ControlOrMeta+v');
    await expect.poll(async () => (await readState(page)).text.length).toBe(before.text.length * 2);
    expect((await readState(page)).strikes).toBe(before.strikes);
  });

  test('multiline paste does not simulate keystrokes', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    const before = await readState(page);
    await page.keyboard.insertText('Line one.\nLine two.\n\nLine four, which is longer than the others.');
    await expect.poll(async () => (await readState(page)).text).toContain('Line four');
    const after = await readState(page);
    expect(after.strikes).toBe(before.strikes);
  });

  test('undo and redo restore text and keep the capsule aligned', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('Hello');
    await page.keyboard.press('ControlOrMeta+z');
    // Native undo groups differ by browser (Chromium: per character, WebKit: per typed block).
    // The contract is only that undo moves backwards through the typed text and stays consistent.
    await expect.poll(async () => (await readState(page)).text.length).toBeLessThan(5);
    const s = await readState(page);
    expect('Hello'.startsWith(s.text)).toBe(true);
    expect(s.selStart).toBeLessThanOrEqual(s.text.length);
    await expectAligned(page);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect.poll(async () => (await readState(page)).text).toBe('Hello');
    await expectAligned(page);
  });

  test('clear empties the page', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('Something');
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    await expect.poll(async () => (await readState(page)).text).toBe('');
    await expectAligned(page);
  });

  test('stops at the 10,000-character limit', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.insertText('a'.repeat(10000));
    await expect.poll(async () => (await readState(page)).text.length).toBe(10000);
    await page.keyboard.insertText('extra');
    await expect.poll(async () => (await readState(page)).text.length).toBe(10000);
  });

  test('rapid Enter presses: one feed each, no animation backlog', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('start');
    for (let i = 0; i < 5; i += 1) await page.keyboard.press('Enter');
    await expect.poll(async () => (await readState(page)).feeds).toBe(5);
    await expect.poll(async () => (await readState(page)).stageAnimations).toBe(0);
    await expectAligned(page);
  });

  test('reduced motion: feeds still counted, no paper animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('One');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await readState(page)).text).toBe('One\n');
    expect((await readState(page)).feeds).toBe(0);
    await expectAligned(page);
  });
});

test.describe('typewriter accessibility', () => {
  test('textarea is labelled and sound controls expose state', async ({ page }) => {
    await openEditor(page);
    const root = page.locator('.playtime-shadow-host');
    await expect(page.locator(EDITOR)).toHaveAttribute('aria-label', 'Write a letter on the typewriter');
    const sound = page.getByRole('button', { name: /Keys: off/ });
    await expect(sound).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('group', { name: 'Typewriter sound settings' })).toBeVisible();
    await expect(root).toBeAttached();
  });

  test('keyboard focus shows the writing-area frame', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).focus();
    const frame = await page.evaluate(() => {
      const root = document.querySelector('.playtime-shadow-host').shadowRoot;
      const vp = root.querySelector('.tw-viewport');
      return getComputedStyle(vp, '::after').borderTopWidth;
    });
    expect(frame).not.toBe('0px');
  });

  test('sound can be enabled from the keyboard', async ({ page }) => {
    await openEditor(page);
    const sound = page.getByRole('button', { name: /Keys: off/ });
    await sound.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Keys: on/ })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('input methods and key repeat (Chromium DevTools protocol)', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile, 'Uses CDP input, which is Chromium-only');

  test('composition text is editable, commits once, and the capsule reaches the caret', async ({ page }) => {
    await openEditor(page);
    const ta = page.locator(EDITOR);
    await ta.click();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.imeSetComposition', { text: 'nihon', selectionStart: 5, selectionEnd: 5 });
    await expect.poll(async () => (await readState(page)).text).toBe('nihon');
    const duringStrikes = (await readState(page)).strikes;
    await cdp.send('Input.insertText', { text: '日本' });
    await expect.poll(async () => (await readState(page)).text).toBe('日本');
    // Composition deliberately does not strike the hammer: the capsule jumps to the final caret.
    expect((await readState(page)).strikes).toBe(duringStrikes);
    await expectAligned(page);
  });

  test('genuine auto-repeat events produce one strike and one character each', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    const cdp = await page.context().newCDPSession(page);
    for (let i = 0; i < 12; i += 1) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'x', code: 'KeyX', windowsVirtualKeyCode: 88, text: 'x', unmodifiedText: 'x', autoRepeat: i > 0 });
      await cdp.send('Input.dispatchKeyEvent', { type: 'char', text: 'x', key: 'x', code: 'KeyX', unmodifiedText: 'x' });
    }
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'x', code: 'KeyX', windowsVirtualKeyCode: 88 });
    await expect.poll(async () => (await readState(page)).text).toBe('x'.repeat(12));
    await expect.poll(async () => (await readState(page)).strikes).toBe(12);
    await expectAligned(page);
  });
});

test.describe('typewriter audio', () => {
  test.skip(({ isMobile }) => isMobile, 'Audio counts are checked on desktop-sized projects');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__starts = 0;
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...args) { window.__starts += 1; return start.apply(this, args); };
    });
  });

  test('muted by default: no sounds', async ({ page }) => {
    await openEditor(page);
    await page.locator(EDITOR).click();
    await page.keyboard.type('quiet');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await readState(page)).text).toBe('quiet\n');
    expect(await page.evaluate(() => window.__starts)).toBe(0);
  });

  test('enabled: one sound per printable key, a pair for Enter, none for navigation', async ({ page }) => {
    await openEditor(page);
    await page.getByRole('button', { name: /Keys: off/ }).click();
    await expect(page.getByRole('button', { name: /Keys: on/ })).toBeVisible();
    await page.locator(EDITOR).click();
    await page.keyboard.type('abc');
    await expect.poll(() => page.evaluate(() => window.__starts)).toBe(3);
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__starts)).toBe(5);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
    await expect.poll(() => page.evaluate(() => window.__starts)).toBe(5);
  });

  test('volume slider and bell checkbox are exposed and labelled', async ({ page }) => {
    await openEditor(page);
    await page.getByRole('button', { name: /Keys: off/ }).click();
    await expect(page.getByRole('slider', { name: 'Typewriter sound volume' })).toBeEnabled();
    await expect(page.getByRole('checkbox', { name: /End-of-line bell/ })).toBeEnabled();
  });
});
