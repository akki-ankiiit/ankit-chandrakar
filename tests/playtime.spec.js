import { test, expect } from '@playwright/test';

const isYouTubeRequest = (url) => /(^|\.)(youtube\.com|youtube-nocookie\.com|ytimg\.com)$/.test(new URL(url).hostname);

test('slow WebGL loading does not hide or remount the Playtime hero', async ({ page }) => {
  const errors = [];
  const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  let releaseTexture;
  const textureGate = new Promise((resolve) => { releaseTexture = resolve; });
  await page.route('**/assets/water.png', async (route) => {
    await textureGate;
    await route.continue();
  });

  try {
    await page.goto('/playtime');
    const hero = page.locator('#playtime-title');
    await expect(hero).toBeVisible();
    await expect(page.locator('[data-playtime-root] #top')).toBeAttached();
    expect(requests.filter((url) => isYouTubeRequest(url) || new URL(url).pathname === '/assets/water.png')).toEqual([]);
    await page.evaluate(() => {
      window.playtimeHero = document.getElementById('playtime-title');
      window.playtimeMount = document.querySelector('.playtime-shadow-host').shadowRoot.querySelector('[data-playtime-root]');
      window.playtimeHidden = false;
      const sample = () => {
        const section = window.playtimeHero.closest('section');
        if (!window.playtimeHero.isConnected || getComputedStyle(section).display === 'none' || getComputedStyle(section).visibility === 'hidden') window.playtimeHidden = true;
        window.playtimeFrame = requestAnimationFrame(sample);
      };
      sample();
    });

    const textureRequest = page.waitForRequest('**/assets/water.png');
    await page.locator('#water-ripple').scrollIntoViewIfNeeded();
    await textureRequest;
    await expect(hero).toBeVisible();
    await expect(page.locator('.route-loading')).toHaveCount(0);
    const textureResponse = page.waitForResponse('**/assets/water.png');
    releaseTexture();
    await (await textureResponse).finished();
    await expect(page.locator('#water-ripple [data-water-ready]')).toHaveAttribute('data-water-ready', 'true');
    await expect.poll(() => page.evaluate(() => {
      const host = document.querySelector('.playtime-shadow-host');
      return !window.playtimeHidden && window.playtimeHero === document.getElementById('playtime-title') && window.playtimeMount === host.shadowRoot.querySelector('[data-playtime-root]');
    })).toBe(true);
    await page.evaluate(() => cancelAnimationFrame(window.playtimeFrame));
    expect(errors).toEqual([]);
  } finally {
    releaseTexture();
  }
});

test('deferred experiments remain reachable by keyboard without loading YouTube', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/playtime');
  const entry = page.locator('#flipbook').getByRole('link', { name: 'Explore Flipbook', exact: true });
  await expect(entry).toBeAttached();
  await entry.focus();
  await expect(page.locator('#flipbook')).toHaveAttribute('data-experiment-mounted', 'true');
  await expect(entry).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#flipbook').getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#flipbook').getByRole('button', { name: 'Previous', exact: true })).toBeEnabled();
  expect(requests.filter(isYouTubeRequest)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('Back restores the saved Playtime position instead of replaying its deep link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/playtime#globe-gallery');
  const globe = page.locator('#globe-gallery');
  await expect(globe).toBeAttached();
  await expect.poll(() => globe.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(3);
  await page.evaluate(() => scrollTo({ top: 2000, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(2000);
  // The scroll listener records the browser's event before leaving this entry.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.locator('.desktop-nav a[href="/about"]').dispatchEvent('click', { button: 0 });
  await expect(page).toHaveURL('/about');
  await expect(page.locator('#about-page-title')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('/playtime#globe-gallery');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(2000);
  // Activating an in-shadow anchor must keep React Router's history key intact.
  const entry = page.locator('#flipbook').getByRole('link', { name: 'Explore Flipbook', exact: true });
  await entry.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/playtime#flipbook');
  await page.evaluate(() => scrollTo({ top: 2000, behavior: 'instant' }));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.locator('.desktop-nav a[href="/about"]').dispatchEvent('click', { button: 0 });
  await expect(page.locator('#about-page-title')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('/playtime#flipbook');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(2000);
  await expect(page.locator('[data-playtime-root]')).toHaveCount(1);
  await expect(page.locator('#playtime-properties')).toHaveCount(1);
});
