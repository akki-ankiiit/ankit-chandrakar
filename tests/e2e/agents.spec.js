import { test, expect } from '@playwright/test';
import { getOrbColour, hexToRgb } from '../../src/agents/orb-palette.js';

const names = ['Helix', 'Iris', 'Atlas', 'Terra', 'Echo', 'Vega', 'Ledger', 'Lumen', 'Weave', 'Batch', 'Probe', 'Delta', 'Guard', 'Quill'];
const states = ['working', 'searching', 'solving', 'listening', 'connecting', 'weaving', 'composing', 'breathing', 'shaping'];
const agentsURL = '/work/mistribhai#agents';
const canvasImage = (canvas) => canvas.evaluate((element) => element.toDataURL());
const anchorOffset = (page) => page.locator('#agents').evaluate((element) => Math.abs(
  element.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) - parseFloat(getComputedStyle(element).scrollMarginTop)
));
const browserErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

test('Helix embeds Agents below its website, preserves its title and restores the anchor on reload', async ({ page }) => {
  await page.goto('/about');
  const mobile = page.getByRole('button', { name: 'Open menu', exact: true });
  const isMobile = await mobile.isVisible();
  if (isMobile) await mobile.click();
  const navigation = page.getByRole('navigation', { name: isMobile ? 'Mobile navigation' : 'Main navigation', exact: true });
  await expect(navigation.getByRole('link', { name: 'Agents', exact: true })).toHaveCount(0);
  if (isMobile) await page.keyboard.press('Escape');
  // Exercise client navigation with the destination module deliberately delayed.
  await page.route('**/src/pages/CaseStudy.jsx*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.continue();
  });
  await page.evaluate((url) => {
    history.pushState({}, '', url);
    dispatchEvent(new PopStateEvent('popstate'));
  }, agentsURL);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helix.labs');
  await expect(page.getByRole('heading', { level: 2, name: 'Agents, with personality.', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('Helix.labs — Ankit Chandrakar');
  const facade = page.locator('.showcase-site .showcase-embed-facade');
  if (await facade.count()) {
    await facade.click();
    await page.locator('#agents').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
  }
  const iframe = page.locator('.showcase-site iframe');
  await expect(iframe).toHaveAttribute('src', 'https://helixlab-one.vercel.app/projects');
  expect(await page.locator('#agents').evaluate((element) => {
    const website = element.previousElementSibling;
    return website.matches('.showcase-site') && !!website.querySelector('iframe') && website.getBoundingClientRect().bottom <= element.getBoundingClientRect().top;
  })).toBe(true);
  await expect.poll(() => anchorOffset(page)).toBeLessThan(3);
  await page.reload();
  await expect(page.locator('#agents').getByRole('article')).toHaveCount(14);
  await expect.poll(() => anchorOffset(page)).toBeLessThan(3);
  for (const name of names) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.locator('#footer')).toBeAttached();
  await page.getByRole('button', { name: 'Customize Helix', exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('all nine orb states render distinct static previews at retina resolution', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(agentsURL);
  const selector = page.getByRole('group', { name: 'Orb states', exact: true });
  await expect(selector.getByRole('button')).toHaveCount(9);
  const images = new Set();
  for (const state of states) {
    const button = selector.getByRole('button', { name: `Preview ${state} orb`, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.agents-orb-caption h3')).toHaveText(state);
    const canvas = page.locator('.agents-orb-stage canvas');
    await expect(canvas).toBeVisible();
    images.add(await canvasImage(canvas));
    // Check painted pixels, rather than a CSS tint or the selector's appearance.
    const expected = hexToRgb(getOrbColour(state));
    expect(await canvas.evaluate((element, colour) => {
      const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data;
      let matching = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        // The engine shades each dot along the tint-to-white ramp for depth.
        const shade = (pixels[i + 2] - colour.b) / (255 - colour.b);
        const red = colour.r + (255 - colour.r) * shade;
        const green = colour.g + (255 - colour.g) * shade;
        if (pixels[i + 3] > 100 && shade >= 0 && shade < .8 && Math.abs(pixels[i] - red) < 5 && Math.abs(pixels[i + 1] - green) < 5) matching++;
      }
      return matching;
    }, expected)).toBeGreaterThan(20);
    expect(await canvas.evaluate((element) => element.width / element.getBoundingClientRect().width)).toBe(await page.evaluate(() => Math.min(2, devicePixelRatio)));
  }
  expect(images.size).toBe(9);
  await expect(selector.locator('[aria-pressed="true"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const screenshot = testInfo.outputPath('agents-showcase.png');
  // CSS-pixel output keeps the long single-column roster within mobile capture limits.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: screenshot, fullPage: true, scale: 'css' });
  await testInfo.attach('agents-showcase', { path: screenshot, contentType: 'image/png' });
  const embeddedScreenshot = testInfo.outputPath('agents-embedded.png');
  await page.locator('#agents').evaluate((element) => window.scrollTo({ top: element.offsetTop - 120, behavior: 'instant' }));
  await page.screenshot({ path: embeddedScreenshot, scale: 'css' });
  await testInfo.attach('agents-embedded', { path: embeddedScreenshot, contentType: 'image/png' });
});

test('customization updates appearance, resets, closes with Escape and restores focus', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(agentsURL);
  const trigger = page.getByRole('button', { name: 'Customize Iris', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Iris · Reader', exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close customization' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  const screenshot = testInfo.outputPath('agents-character-studio.png');
  await page.screenshot({ path: screenshot });
  await testInfo.attach('agents-character-studio', { path: screenshot, contentType: 'image/png' });
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  const canvas = dialog.locator('.agents-bot canvas');
  const original = await canvasImage(canvas);
  await dialog.getByLabel('Body colour').fill('#ff3355');
  await dialog.getByLabel('Face', { exact: true }).selectOption('mouth');
  await dialog.getByLabel('Hat', { exact: true }).selectOption('crown');
  await dialog.getByLabel('Glasses', { exact: true }).selectOption('shades');
  await dialog.getByLabel('Bow tie', { exact: true }).check();
  await expect.poll(() => canvasImage(canvas)).not.toBe(original);
  await dialog.getByLabel('Material', { exact: true }).selectOption('fabric');
  await expect(dialog.getByLabel('Material', { exact: true })).toHaveValue('fabric');
  await dialog.getByRole('button', { name: 'Reset Iris to default', exact: true }).click();
  await expect(dialog.getByLabel('Face', { exact: true })).toHaveValue('eyes');
  await expect(dialog.getByLabel('Hat', { exact: true })).toHaveValue('none');
  await expect(dialog.getByLabel('Glasses', { exact: true })).toHaveValue('round');
  await expect(dialog.getByLabel('Material', { exact: true })).toHaveValue('plastic');
  await expect(dialog.getByLabel('Bow tie', { exact: true })).not.toBeChecked();
  await expect.poll(() => canvasImage(canvas)).toBe(original);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await trigger.click();
  await page.getByRole('button', { name: 'Close customization' }).click();
  await expect(trigger).toBeFocused();
});

test('actual mouse opener regains focus after Escape and Close', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(agentsURL);
  const trigger = page.getByRole('button', { name: 'Customize Iris', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Iris · Reader', exact: true });
  for (const closeWithEscape of [true, false]) {
    // Start with a different focused element. A real mouse click must establish the opener
    // even on WebKit, where clicking a button does not focus it by default.
    await page.locator('#main').focus();
    await trigger.scrollIntoViewIfNeeded();
    const box = await trigger.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(dialog).toBeVisible();
    if (closeWithEscape) await page.keyboard.press('Escape');
    else await dialog.getByRole('button', { name: 'Close customization', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  }
  // Keyboard activation should preserve the same opener contract.
  await trigger.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('Iris retains the original renderer colour defaults, including after reset and shape changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(agentsURL);
  await page.getByRole('button', { name: 'Customize Iris', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Iris · Reader', exact: true });
  const brightness = dialog.getByRole('slider', { name: 'Brightness', exact: true });
  const saturation = dialog.getByRole('slider', { name: 'Saturation', exact: true });
  const canvas = dialog.locator('.agents-bot canvas');
  const setRange = async (slider, value) => {
    await slider.evaluate((element, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(element, String(value));
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await expect(slider).toHaveValue(String(value));
  };

  // Known bot-avatars 0.2.2 cat signature, independent of the showcase's initial image.
  await expect(brightness).toHaveValue('1.22');
  await expect(saturation).toHaveValue('1.88');
  await expect(dialog.locator('.agents-field').filter({ has: page.getByRole('slider', { name: 'Brightness', exact: true }) }).locator('output')).toHaveText('1.22');
  await expect(dialog.locator('.agents-field').filter({ has: page.getByRole('slider', { name: 'Saturation', exact: true }) }).locator('output')).toHaveText('1.88');
  const initial = await canvasImage(canvas);
  await setRange(brightness, 1);
  await setRange(saturation, 1);
  await setRange(brightness, 1.22);
  await setRange(saturation, 1.88);
  await canvas.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const sourceColourReference = await canvasImage(canvas);
  expect(initial).toBe(sourceColourReference);

  await setRange(brightness, 0.9);
  await setRange(saturation, 0.7);
  await expect.poll(() => canvasImage(canvas)).not.toBe(sourceColourReference);
  await dialog.getByLabel('Shape', { exact: true }).selectOption('drop');
  await expect(brightness).toHaveValue('0.9');
  await expect(saturation).toHaveValue('0.7');
  await dialog.getByRole('button', { name: 'Reset Iris to default', exact: true }).click();
  await expect(dialog.getByLabel('Shape', { exact: true })).toHaveValue('cat');
  await expect(brightness).toHaveValue('1.22');
  await expect(saturation).toHaveValue('1.88');
  await expect.poll(() => canvasImage(canvas)).toBe(sourceColourReference);

  // Reset removes the overrides: untouched controls follow the new shape, not the old character.
  await dialog.getByLabel('Shape', { exact: true }).selectOption('clover');
  await expect(brightness).toHaveValue('1.2');
  await expect(saturation).toHaveValue('1.59');
  await dialog.getByLabel('Shape', { exact: true }).selectOption('drop');
  await expect(brightness).toHaveValue('1');
  await expect(saturation).toHaveValue('1.5');
  await dialog.getByLabel('Shape', { exact: true }).selectOption('cat');
  await expect(brightness).toHaveValue('1.22');
  await expect(saturation).toHaveValue('1.88');
  await expect.poll(() => canvasImage(canvas)).toBe(sourceColourReference);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Customize Vega', exact: true }).click();
  const vega = page.getByRole('dialog', { name: 'Vega · Target setter', exact: true });
  await expect(vega.getByRole('slider', { name: 'Brightness', exact: true })).toHaveValue('1.1');
  await expect(vega.getByRole('slider', { name: 'Saturation', exact: true })).toHaveValue('1.84');
});

test('preview activity and motion controls are interactive, with live reduced-motion handling', async ({ page }) => {
  await page.goto(agentsURL);
  await page.getByRole('button', { name: 'Preview Probe activity', exact: true }).click();
  await expect(page.locator('.agents-orb-caption')).toContainText('Probe’s signature activity');
  await expect(page.getByRole('button', { name: 'Preview working orb', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const motion = page.getByRole('group', { name: 'Motion', exact: true });
  await motion.getByRole('button', { name: 'still', exact: true }).click();
  await expect(page.locator('.agents-page [data-animating="true"]')).toHaveCount(0);
  const canvas = page.locator('.agents-orb-stage canvas');
  await canvas.scrollIntoViewIfNeeded();
  const still = await canvasImage(canvas);
  await page.waitForTimeout(200);
  expect(await canvasImage(canvas)).toBe(still);
  await motion.getByRole('button', { name: 'calm', exact: true }).click();
  await canvas.scrollIntoViewIfNeeded();
  await expect(page.locator('.agents-orb-stage .agents-orb')).toHaveAttribute('data-animating', 'true');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.agents-page [data-animating="true"]')).toHaveCount(0);
  await page.evaluate(() => {
    delete document.hidden;
    delete document.visibilityState;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.agents-orb-stage .agents-orb')).toHaveAttribute('data-animating', 'true');
  await expect.poll(() => canvasImage(canvas)).not.toBe(still);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.agents-page [data-animating="true"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.agents-orb-stage .agents-orb')).toHaveAttribute('data-animating', 'true');
  const activity = page.getByRole('group', { name: 'Activity preview', exact: true });
  await activity.getByRole('button', { name: 'sleeping', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Helix, Conductor agent, sleeping preview', exact: true })).toBeAttached();
  await expect(page.locator('.agents-badge-orb')).toHaveCount(0);
  await activity.getByRole('button', { name: 'working', exact: true }).click();
  await expect(page.locator('.agents-badge-orb')).toHaveCount(14);
  const badge = page.locator('.agents-badge-orb canvas').first();
  // The small package renderer must receive the same palette as the large engine.
  await expect.poll(() => badge.evaluate((element) => {
    const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data;
    let green = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 100 && pixels[i + 1] > pixels[i + 2] + 15) green++;
    return green;
  })).toBeGreaterThan(0);
  expect(await page.locator('.agents-page [data-animating="true"]').count()).toBeLessThanOrEqual(12);
  await page.getByRole('heading', { name: 'Quill', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.locator('.agents-orb-stage .agents-orb')).toHaveAttribute('data-animating', 'false');
  await expect(page.locator('.agents-grid .agents-bot').first()).toHaveAttribute('data-animating', 'false');
});

test('legacy route variants redirect to the embedded anchor without horizontal overflow', async ({ page }) => {
  for (const url of ['/agents', '/agents/', '/Agents', '/Agents/']) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/work\/mistribhai#agents$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helix.labs');
    await expect(page).toHaveTitle('Helix.labs — Ankit Chandrakar');
    await expect.poll(() => anchorOffset(page)).toBeLessThan(3);
  }
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://ankitchandrakar.in/assets/social-preview.gif');
  expect(await page.locator('.agents-page').evaluate((element) => {
    return parseFloat(getComputedStyle(element).paddingTop);
  })).toBe(page.viewportSize().width < 750 ? 24 : 32);
  await expect(page.locator('#agents > .agents-container')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('.agents-card').evaluateAll((cards) => cards.every((card) => {
    const box = card.getBoundingClientRect();
    const role = card.querySelector('.agents-role');
    // Check each card's content as well as its outer bounds.
    const contentFits = [...card.children].filter((child) => !child.classList.contains('selection-frame')).every((child) => {
      const childBox = child.getBoundingClientRect();
      return childBox.left >= box.left && childBox.right <= box.right && child.scrollWidth <= child.clientWidth;
    });
    return box.left >= 0 && box.right <= innerWidth && contentFits && parseFloat(getComputedStyle(role).fontSize) >= 14;
  }))).toBe(true);
});

test('desktop navigation fits the narrow desktop breakpoint', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One desktop project checks the shared breakpoint range.');
  for (const width of [750, 768, 820, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(agentsURL);
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    await expect(nav.getByRole('link', { name: 'Agents', exact: true })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'My work', exact: true })).toBeVisible();
    expect(await nav.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const brand = document.querySelector('.brand').getBoundingClientRect();
      const children = [...element.children].map((child) => child.getBoundingClientRect());
      return box.left >= brand.right + 10 && box.right <= innerWidth && children.every((child) => child.top >= box.top && child.bottom <= box.bottom);
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('other website showcases exclude the Agents experience', async ({ page }) => {
  await page.goto('/work/blackspace');
  await expect(page.locator('.showcase-site')).toBeAttached();
  await expect(page.locator('#agents')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Customize Helix', exact: true })).toHaveCount(0);
});

test('legacy redirect replaces its history entry and cleans up an open studio on back', async ({ page }) => {
  await page.goto('/about');
  await page.evaluate(() => {
    history.pushState({}, '', '/Agents/');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page).toHaveURL(/\/work\/mistribhai#agents$/);
  await page.getByRole('button', { name: 'Customize Helix', exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});
