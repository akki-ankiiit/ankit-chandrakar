import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function openPlayer(page) {
  await page.goto('/playtime');
  const player = page.locator('[data-pocket-player]');
  await player.getByRole('listbox', { name: 'Music tracks' }).focus();
  return player;
}

// Exercise the real SDK loading boundary without depending on remote media.
// Player events are controlled separately from load/play commands so the UI
// must wait for confirmation rather than treating a click as successful audio.
const mockSdk = `
window.pocketMockPlayers = [];
window.YT = { Player: class {
  constructor(element, options) {
    this.events = options.events;
    this.playCalls = 0;
    this.iframe = document.createElement('iframe');
    this.iframe.title = 'Mock music player';
    element.appendChild(this.iframe);
    window.pocketMockPlayers.push(this);
    setTimeout(() => this.events.onReady({ target: this }), 0);
  }
  getIframe() { return this.iframe; }
  getDuration() { return 195; }
  getCurrentTime() { return 4; }
  cueVideoById(id) { this.track = id; }
  loadVideoById(id) { this.track = id; this.emit(3); }
  playVideo() { this.playCalls++; if (this.state !== 1) this.emit(3); }
  pauseVideo() { this.emit(2); }
  seekTo() {}
  destroy() { this.iframe.remove(); }
  emit(data) { this.state = data; this.events.onStateChange({ target: this, data }); }
  fail() { this.events.onError({ target: this, data: 100 }); }
} };
`;

async function liveMock(page) {
  await expect.poll(() => page.evaluate(() => window.pocketMockPlayers?.filter(p => p.iframe.isConnected).length || 0)).toBe(1);
}

test('Start playing transfers keyboard focus into a single-main Playtime experience', async ({ page }) => {
  await page.goto('/playtime');
  await expect(page.locator('[data-playtime-root] #top')).toBeAttached();
  await expect(page.getByRole('main')).toHaveCount(1);
  await page.getByRole('button', { name: 'Start playing', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Explore Flower trail', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox', { name: 'Music tracks' })).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(500);
});

test('the full opened flipbook fits and mobile helper text clears both controls', async ({ page }) => {
  await page.goto('/playtime');
  const flipbook = page.locator('#flipbook');
  await flipbook.getByRole('link', { name: 'Explore Flipbook', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(flipbook.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(flipbook.getByRole('button', { name: 'Previous', exact: true })).toBeEnabled();
  for (const index of [0, 1]) {
    await expect.poll(async () => {
      const box = await flipbook.locator(`[data-flipbook-leaf="${index}"]`).boundingBox();
      return box.x >= 7 && box.x + box.width <= page.viewportSize().width - 7;
    }).toBe(true);
  }
  if (page.viewportSize().width < 768) {
    const helper = await flipbook.locator('[data-flipbook-help]').boundingBox();
    for (const name of ['Previous', 'Next']) {
      const box = await flipbook.getByRole('button', { name, exact: true }).boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(helper.y);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width);
});

test('dock ends are reachable by local scrolling and keyboard, and reduced motion stays static', async ({ page }) => {
  await page.goto('/playtime');
  const dock = page.locator('#dock');
  await dock.getByRole('link', { name: 'Explore Dock', exact: true }).focus();
  const track = dock.locator('[data-dock-scroll]');
  const first = dock.getByRole('button', { name: 'Sketch', exact: true });
  const last = dock.getByRole('button', { name: 'Prime Video', exact: true });
  await first.focus();
  await expect(dock.getByRole('tooltip', { name: 'Sketch', exact: true })).toBeVisible();
  expect((await first.boundingBox()).x).toBeGreaterThanOrEqual(0);
  await track.evaluate(n => { n.scrollLeft = n.scrollWidth; });
  const endBox = await last.boundingBox();
  expect(endBox.x + endBox.width).toBeLessThanOrEqual(page.viewportSize().width);
  await last.focus();
  await first.focus();
  expect((await first.boundingBox()).x).toBeGreaterThanOrEqual(0);
  await last.focus();
  expect((await last.boundingBox()).x + 56).toBeLessThanOrEqual(page.viewportSize().width);
  const figma = dock.getByRole('button', { name: 'Figma', exact: true });
  await figma.focus();
  await figma.hover();
  await expect.poll(async () => Math.round((await figma.boundingBox()).width)).toBe(56);
  await figma.click();
  const before = await figma.boundingBox();
  await page.waitForTimeout(250);
  expect((await figma.boundingBox()).y).toBeCloseTo(before.y, 0);
  if (page.viewportSize().width >= 750 && !test.info().project.use.hasTouch) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await figma.hover();
    await expect.poll(async () => (await figma.boundingBox()).width).toBeGreaterThan(80);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(async () => Math.round((await figma.boundingBox()).width)).toBe(56);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width);
});

test('carousel buttons can traverse and wrap projects using only the keyboard', async ({ page }) => {
  await page.goto('/playtime');
  const carousel = page.locator('#works');
  await carousel.getByRole('link', { name: 'Explore Project carousel', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(carousel.getByRole('button', { name: 'Previous project', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(carousel.getByRole('status')).toHaveText('Project 9 of 9: Golden Hour');
  await page.keyboard.press('Tab');
  await expect(carousel.getByRole('button', { name: 'Next project', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(carousel.getByRole('status')).toHaveText('Project 1 of 9: Velvet Mirage');
});

test('pocket keyboard selection, explicit loading and network-error retry agree', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let apiRequests = 0;
  await page.route('**/www.youtube.com/iframe_api', route => {
    apiRequests++;
    return apiRequests === 1 ? route.abort('failed') : route.fulfill({ contentType: 'text/javascript', body: mockSdk });
  });
  const player = await openPlayer(page);
  await page.keyboard.press('End');
  await expect(player.getByRole('option', { selected: true })).toHaveAccessibleName('Counting Stars — OneRepublic');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await expect(player.getByRole('option', { selected: true })).toHaveAccessibleName('Blinding Lights — The Weeknd');
  await player.getByRole('button', { name: 'Next track', exact: true }).click();
  await expect(player.getByRole('option', { selected: true })).toHaveAccessibleName('Save Your Tears — The Weeknd');
  await player.getByRole('button', { name: 'Previous track', exact: true }).click();
  await expect(player.getByRole('option', { selected: true })).toHaveAccessibleName('Blinding Lights — The Weeknd');
  expect(apiRequests).toBe(0);
  for (const button of await player.getByRole('button').all()) {
    const box = await button.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await player.getByRole('button', { name: 'Select track', exact: true }).click();
  await expect(player.getByRole('alert')).toContainText('Music couldn’t load');
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
  await player.getByRole('button', { name: 'Retry music', exact: true }).click();
  await liveMock(page);
  await expect(player.getByRole('status')).toHaveText('Loading music…');
  await expect(player.getByRole('heading', { name: 'Blinding Lights', exact: true })).toBeVisible();
  await page.evaluate(() => window.pocketMockPlayers.find(p => p.iframe.isConnected).emit(1));
  await expect(player.getByRole('status')).toHaveText('Now Playing');
  await page.evaluate(() => window.pocketMockPlayers.find(p => p.iframe.isConnected).emit(2));
  await expect(player.getByRole('status')).toHaveText('Paused');
  await player.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(player.getByRole('status')).toHaveText('Loading music…');
  await player.getByRole('button', { name: 'Cancel loading', exact: true }).click();
  await page.evaluate(() => window.pocketMockPlayers.find(p => p.iframe.isConnected).emit(1));
  await expect(player.getByRole('status')).toHaveText('Paused');
  await player.getByRole('button', { name: 'Play', exact: true }).click();
  await page.evaluate(() => window.pocketMockPlayers.find(p => p.iframe.isConnected).emit(1));
  await player.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(player.getByRole('status')).toHaveText('Paused');
  expect(apiRequests).toBe(2);
  expect(errors).toEqual([]);
});

test('pocket keeps the current playing song active when selected again beyond the loading timeout', async ({ page }) => {
  await page.clock.install();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'text/javascript', body: mockSdk }));
  const player = await openPlayer(page);
  await page.keyboard.press('Enter');
  await liveMock(page);
  await page.evaluate(() => {
    window.reselectedPocketPlayer = window.pocketMockPlayers.find(p => p.iframe.isConnected);
    window.reselectedPocketPlayer.emit(1);
  });
  await expect(player.getByRole('status')).toHaveText('Now Playing');
  await player.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(player.getByRole('option', { selected: true })).toHaveAccessibleName('2002 — Anne-Marie');
  await player.getByRole('button', { name: 'Select track', exact: true }).click();
  await expect(player.getByRole('status')).toHaveText('Now Playing');
  await expect(player.getByRole('heading', { name: '2002', exact: true })).toBeVisible();
  await page.clock.fastForward(12500);
  await expect(player.getByRole('status')).toHaveText('Now Playing');
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(player.getByRole('alert')).toHaveCount(0);
  expect(await page.evaluate(() => ({
    connected: window.reselectedPocketPlayer.iframe.isConnected,
    playCalls: window.reselectedPocketPlayer.playCalls,
    state: window.reselectedPocketPlayer.state,
  }))).toEqual({ connected: true, playCalls: 0, state: 1 });
  expect(errors).toEqual([]);
});

test('pocket handles player errors and ignores stale events after retry and unmount', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'text/javascript', body: mockSdk }));
  const player = await openPlayer(page);
  await page.keyboard.press('Enter');
  await liveMock(page);
  await page.evaluate(() => window.pocketMockPlayers.filter(p => !p.iframe.isConnected).forEach(p => p.fail()));
  await expect(player.getByRole('status')).toHaveText('Loading music…');
  await page.evaluate(() => { window.oldPocketPlayer = window.pocketMockPlayers.find(p => p.iframe.isConnected); window.oldPocketPlayer.fail(); });
  await expect(player.getByRole('alert')).toBeVisible();
  await player.getByRole('button', { name: 'Retry music', exact: true }).click();
  await liveMock(page);
  await page.evaluate(() => { window.oldPocketPlayer.emit(1); window.oldPocketPlayer.fail(); });
  await expect(player.getByRole('status')).toHaveText('Loading music…');
  await page.evaluate(() => window.pocketMockPlayers.find(p => p.iframe.isConnected).emit(1));
  await expect(player.getByRole('status')).toHaveText('Now Playing');
  await page.locator('.brand').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/');
  await page.evaluate(() => window.pocketMockPlayers.forEach(p => { p.emit(1); p.fail(); }));
  expect(errors).toEqual([]);
});

test('pocket times out a silent SDK and cancels its script and timers on route exit', async ({ page }) => {
  await page.clock.install();
  await page.route('**/www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'text/javascript', body: '/* SDK unavailable */' }));
  const player = await openPlayer(page);
  await page.keyboard.press('Enter');
  await expect(player.getByRole('status')).toHaveText('Loading music…');
  await page.clock.fastForward(12500);
  await expect(player.getByRole('alert')).toBeVisible();
  await expect(page.locator('script[data-pocket-youtube-api]')).toHaveCount(0);
  await player.getByRole('button', { name: 'Retry music', exact: true }).click();
  await expect(page.locator('script[data-pocket-youtube-api]')).toHaveCount(1);
  await page.locator('.brand').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/');
  await expect(page.locator('script[data-pocket-youtube-api]')).toHaveCount(0);
  await page.clock.fastForward(15000);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
