import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const isYouTubeRequest = (url) => /(^|\.)(youtube\.com|youtube-nocookie\.com|ytimg\.com)$/.test(new URL(url).hostname);

test('Pocket Vibes aligns responsively and shows a static poster for reduced motion without controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/playtime');
  const video = page.locator('[data-pocket-video]');
  const illustration = page.locator('[data-pocket-illustration]');
  await expect(video).toBeAttached();
  await illustration.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(video).toHaveAttribute('src', '/assets/video/pocket-player-web.mp4');
  await expect.poll(() => video.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2);
  expect(await video.evaluate((node) => node.paused && node.currentTime === 0 && node.muted && node.loop && node.playsInline)).toBe(true);
  await expect(video).toBeHidden();
  await expect(illustration.locator('img')).toBeVisible();
  await expect(illustration.locator('img')).toHaveAttribute('src', '/assets/video/pocket-player-poster.webp');
  await expect(page.locator('[data-pocket-video-toggle]')).toHaveCount(0);
  await expect(illustration.locator('button, figcaption')).toHaveCount(0);
  expect(await video.evaluate((node) => node.controls)).toBe(false);

  const playerBox = await page.locator('[data-pocket-player]').boundingBox();
  const videoBox = await illustration.boundingBox();
  expect(playerBox.width).toBe(300);
  expect(playerBox.height).toBe(480);
  if (page.viewportSize().width <= 749) {
    expect(videoBox.y - (playerBox.y + playerBox.height)).toBeCloseTo(48, 0);
    expect(videoBox.x + videoBox.width / 2).toBeCloseTo(playerBox.x + playerBox.width / 2, 0);
  } else {
    expect(videoBox.y).toBeCloseTo(playerBox.y, 0);
    expect(videoBox.height).toBeCloseTo(480, 0);
    expect(playerBox.x - (videoBox.x + videoBox.width)).toBeCloseTo(64, 0);
    expect(playerBox.x + playerBox.width / 2).toBeGreaterThan(page.viewportSize().width / 2);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  expect(await video.evaluate((node) => node.paused)).toBe(true);
  expect(requests.filter(isYouTubeRequest)).toEqual([]);
});

test('Pocket Vibes pauses offscreen and responds to live motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/playtime');
  const video = page.locator('[data-pocket-video]');
  const illustration = page.locator('[data-pocket-illustration]');
  await video.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
  await video.evaluate((node) => scrollTo({ top: scrollY + node.getBoundingClientRect().bottom + 50, behavior: 'instant' }));
  await expect(video).not.toBeInViewport();
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  await video.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  await expect(video).toBeHidden();
  await expect(illustration.locator('img')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(video).toBeVisible();
  await expect(illustration.locator('img')).toHaveCount(0);
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
});

test('Pocket Vibes reconciles interrupted pending playback while respecting autoplay denial and reduced motion', async ({ page }) => {
  for (const outcome of ['resume', 'autoplay-denied', 'reduced-motion']) {
    // Install a per-element delayed play promise before allowing automatic motion.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/playtime');
    const video = page.locator('[data-pocket-video]');
    const illustration = page.locator('[data-pocket-illustration]');
    await illustration.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect.poll(() => video.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2);
    await video.evaluate((node) => {
      const nativePlay = node.play.bind(node);
      const nativePause = node.pause.bind(node);
      node.pendingPlayTest = { calls: 0, pauses: 0, reject: null };
      node.play = () => {
        node.pendingPlayTest.calls += 1;
        if (node.pendingPlayTest.calls > 1) return nativePlay();
        return new Promise((_resolve, reject) => { node.pendingPlayTest.reject = reject; });
      };
      node.pause = () => {
        node.pendingPlayTest.pauses += 1;
        nativePause();
      };
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => video.evaluate((node) => node.pendingPlayTest.calls)).toBe(1);
    const pauseCount = await video.evaluate((node) => node.pendingPlayTest.pauses);
    await video.evaluate((node) => scrollTo({ top: scrollY + node.getBoundingClientRect().bottom + 50, behavior: 'instant' }));
    // Wait for the component's offscreen observer to interrupt the pending play.
    await expect.poll(() => video.evaluate((node) => node.pendingPlayTest.pauses)).toBeGreaterThan(pauseCount);
    await video.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    // A fresh observer confirms delivery of the visible entry before rejection.
    await video.evaluate((node) => new Promise((resolve) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { observer.disconnect(); resolve(); }
      });
      observer.observe(node);
    }));
    expect(await video.evaluate((node) => node.pendingPlayTest.calls)).toBe(1);
    if (outcome === 'reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    await video.evaluate(async (node, denied) => {
      node.pendingPlayTest.reject(new DOMException('Controlled pending play rejection', denied ? 'NotAllowedError' : 'AbortError'));
      // Drain promise handlers and observer delivery before asserting no retry.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, outcome === 'autoplay-denied');

    if (outcome === 'resume') {
      await expect.poll(() => video.evaluate((node) => node.pendingPlayTest.calls)).toBe(2);
      await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
    } else {
      expect(await video.evaluate((node) => node.pendingPlayTest.calls), outcome).toBe(1);
      expect(await video.evaluate((node) => node.paused), outcome).toBe(true);
    }
    if (outcome === 'autoplay-denied') {
      // Later visibility and preference changes must not retry policy denial.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(video).toBeHidden();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(video).toBeVisible();
      await illustration.evaluate((node) => scrollTo({ top: scrollY + node.getBoundingClientRect().bottom + 50, behavior: 'instant' }));
      await expect(illustration).not.toBeInViewport();
      await illustration.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await expect(illustration).toBeInViewport();
      expect(await video.evaluate((node) => node.pendingPlayTest.calls)).toBe(1);
      expect(await video.evaluate((node) => node.paused)).toBe(true);
    }
  }
});

test('slow WebGL loading does not hide or remount the Playtime hero', async ({ page }) => {
  const errors = [];
  const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  let releaseTexture;
  const textureGate = new Promise((resolve) => { releaseTexture = resolve; });
  await page.route('**/assets/video/fluid-poster.webp', async (route) => {
    await textureGate;
    await route.continue();
  });

  try {
    await page.goto('/playtime');
    const hero = page.locator('#playtime-title');
    await expect(hero).toBeVisible();
    await expect(page.locator('[data-playtime-root] #top')).toBeAttached();
    expect(requests.filter((url) => isYouTubeRequest(url) || /\/assets\/video\/fluid-(poster\.webp|web\.mp4)$/.test(new URL(url).pathname))).toEqual([]);
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

    const textureRequest = page.waitForRequest('**/assets/video/fluid-poster.webp');
    await page.locator('#water-ripple').scrollIntoViewIfNeeded();
    await textureRequest;
    await expect(hero).toBeVisible();
    await expect(page.locator('.route-loading')).toHaveCount(0);
    const textureResponse = page.waitForResponse('**/assets/video/fluid-poster.webp');
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

async function openFluid(page) {
  await page.goto('/playtime');
  await page.locator('#water-ripple').getByRole('link', { name: 'Explore Water ripple', exact: true }).focus();
  const fluid = page.locator('#water-ripple [data-water-ready]');
  await expect(fluid).toHaveAttribute('data-water-ready', 'true', { timeout: 15000 });
  // Deferred neighbours can change layout while mounting; align the actual mounted surface.
  await scrollFluid(fluid);
  await expect(fluid).toHaveAttribute('data-fluid-active', 'true');
  return { fluid, video: page.locator('[data-fluid-video]'), canvas: fluid.locator('canvas') };
}

async function scrollFluid(fluid, offscreen = false) {
  await fluid.evaluate((node, away) => {
    const rect = node.getBoundingClientRect();
    const top = scrollY + (away ? rect.bottom + 50 : rect.top + (rect.height - innerHeight) / 2);
    // Keep Lenis's internal target aligned with native scrolling during automated navigation.
    if (window.__playtimeLenis) window.__playtimeLenis.scrollTo(top, { immediate: true, force: true });
    else scrollTo({ top, behavior: 'instant' });
  }, offscreen);
}

async function captureFluidFrame(canvas) {
  // Read in the render frame, before the browser clears WebGL's transient drawing buffer.
  // This captures shader pixels directly and avoids screenshot scrolling or compositor delays.
  const url = await canvas.evaluate((node) => new Promise((resolve) => {
    requestAnimationFrame(() => resolve(node.toDataURL('image/png')));
  }));
  return Buffer.from(url.split(',')[1], 'base64');
}

test('Fluid refracts a decoded frozen video frame with a responsive, bounded cursor wake', async ({ page }, testInfo) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { fluid, video, canvas } = await openFluid(page);
  await expect(fluid).toHaveAttribute('data-fluid-media', 'video');
  await expect.poll(() => video.evaluate((node) => ({ paused: node.paused, active: node.parentElement.dataset.fluidActive, decoded: node.readyState >= 2 })), { timeout: 15000 }).toEqual({ paused: false, active: 'true', decoded: true });
  expect(await video.evaluate((node) => node.muted && node.loop && node.playsInline && !node.controls && node.videoWidth === 1264 && node.videoHeight === 720)).toBe(true);
  // Freeze only the backing media; the real shader and pointer handlers keep running.
  await video.evaluate(async (node) => {
    node.pause();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await scrollFluid(fluid);
  await expect(fluid).toHaveAttribute('data-fluid-frameloop', 'always');
  const frozenTime = await video.evaluate((node) => node.currentTime);
  const baseline = await captureFluidFrame(canvas);
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .4);
  await page.mouse.move(box.x + box.width * .65, box.y + box.height * .6, { steps: 6 });
  const disturbed = await captureFluidFrame(canvas);
  await testInfo.attach('fluid-before', { body: baseline, contentType: 'image/png' });
  await testInfo.attach('fluid-wake', { body: disturbed, contentType: 'image/png' });
  expect(errors).toEqual([]);
  expect(await video.evaluate((node) => node.currentTime)).toBe(frozenTime);
  const a = await sharp(baseline).removeAlpha().raw().toBuffer();
  const b = await sharp(disturbed).removeAlpha().raw().toBuffer();
  expect((await sharp(baseline).stats()).channels[0].stdev, 'baseline contains the decoded image, not a cleared WebGL buffer').toBeGreaterThan(15);
  let changed = 0;
  for (let i = 0; i < a.length; i += 3) {
    if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 6) changed++;
  }
  const fraction = changed / (a.length / 3);
  expect(fraction, 'visible refraction must affect more than isolated pixels').toBeGreaterThan(.002);
  expect(fraction, 'wake stays local and preserves the underlying image').toBeLessThan(.4);
  const frameTimes = await page.evaluate(() => new Promise((resolve) => {
    const times = [];
    let previous;
    const sample = (time) => {
      if (previous !== undefined) times.push(time - previous);
      previous = time;
      if (times.length === 6) resolve(times.sort((a, b) => a - b));
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  // Generous software-WebGL budget: catches a stalled render loop without assuming GPU hardware.
  expect(frameTimes[3]).toBeLessThan(1000);
  expect(await canvas.evaluate((node) => getComputedStyle(node).touchAction)).toBe('pan-y');
  await page.mouse.move(0, 0);
});

test('Fluid reconciles an interrupted pending play and pauses a late resolution while the document is hidden', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { fluid, video } = await openFluid(page);
  await video.evaluate((node) => {
    const nativePlay = node.play.bind(node);
    node.pendingFluid = { calls: 0 };
    node.play = () => {
      node.pendingFluid.calls++;
      if (node.pendingFluid.calls > 1) return nativePlay();
      return new Promise((_resolve, reject) => { node.pendingFluid.reject = reject; });
    };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => video.evaluate((node) => node.pendingFluid.calls)).toBe(1);
  await scrollFluid(fluid, true);
  await expect(fluid).toHaveAttribute('data-fluid-active', 'false');
  await scrollFluid(fluid);
  await expect(fluid).toHaveAttribute('data-fluid-active', 'true');
  await video.evaluate((node) => node.pendingFluid.reject(new DOMException('Interrupted play', 'AbortError')));
  await expect.poll(() => video.evaluate((node) => node.pendingFluid.calls)).toBe(2);
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  await video.evaluate((node) => {
    const nativePlay = HTMLMediaElement.prototype.play.bind(node);
    node.play = () => new Promise((resolve) => {
      node.resolveFluidPlay = async () => { await nativePlay(); resolve(); };
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => video.evaluate((node) => typeof node.resolveFluidPlay)).toBe('function');
  // Exercise the visibility API independently from the intersection observer.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(fluid).toHaveAttribute('data-fluid-active', 'false');
  await expect(fluid).toHaveAttribute('data-fluid-frameloop', 'demand');
  await video.evaluate((node) => node.resolveFluidPlay());
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await video.evaluate((node) => { node.play = HTMLMediaElement.prototype.play.bind(node); });
  // Settle the new visible session's controlled play promise as well.
  await video.evaluate((node) => node.resolveFluidPlay());
  await expect(fluid).toHaveAttribute('data-fluid-active', 'true');
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
});

test('Fluid pauses offscreen and switches to a static demand-rendered poster for reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { fluid, video, canvas } = await openFluid(page);
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
  await scrollFluid(fluid, true);
  await expect(fluid).not.toBeInViewport();
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  await expect(fluid).toHaveAttribute('data-fluid-frameloop', 'demand');
  await scrollFluid(fluid);
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  await expect(fluid).toHaveAttribute('data-fluid-media', 'poster');
  await expect(fluid).toHaveAttribute('data-fluid-frameloop', 'demand');
  // Element screenshots include the fixed header over the canvas. Returning from
  // offscreen reveals it with a transform transition; finish that before comparing pixels.
  await page.locator('.site-header').evaluate((node) =>
    Promise.all(node.getAnimations().map((animation) => animation.finished)));
  const poster = await canvas.screenshot({ scale: 'css' });
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + box.width * .4, box.y + box.height * .4);
  const afterInput = await canvas.screenshot({ scale: 'css' });
  const staticPixels = await sharp(poster).removeAlpha().raw().toBuffer();
  const afterPixels = await sharp(afterInput).removeAlpha().raw().toBuffer();
  if (!afterPixels.equals(staticPixels)) {
    await testInfo.attach('fluid-reduced-poster', { body: poster, contentType: 'image/png' });
    await testInfo.attach('fluid-reduced-after-input', { body: afterInput, contentType: 'image/png' });
  }
  expect(afterPixels.equals(staticPixels), 'reduced motion ignores input and preserves the poster pixels').toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(fluid).toHaveAttribute('data-fluid-media', 'video');
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(false);
});

test('Fluid retains a ready poster when video loading fails or autoplay is denied', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/assets/video/fluid-web.mp4', (route) => route.abort());
  const { fluid, video, canvas } = await openFluid(page);
  await expect.poll(() => video.evaluate((node) => Boolean(node.error))).toBe(true);
  await expect(fluid).toHaveAttribute('data-fluid-media', 'poster');
  await expect(canvas).toBeVisible();
  await page.unroute('**/assets/video/fluid-web.mp4');
  await page.addInitScript(() => {
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!this.hasAttribute('data-fluid-video')) return nativePlay.call(this);
      this.deniedPlayCalls = (this.deniedPlayCalls || 0) + 1;
      return Promise.reject(new DOMException('Controlled denial', 'NotAllowedError'));
    };
  });
  const denied = await openFluid(page);
  await expect.poll(() => denied.video.evaluate((node) => node.deniedPlayCalls)).toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(denied.fluid).toHaveAttribute('data-fluid-frameloop', 'demand');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(denied.fluid).toHaveAttribute('data-fluid-frameloop', 'always');
  expect(await denied.video.evaluate((node) => node.paused && node.deniedPlayCalls === 1)).toBe(true);
  await expect(denied.fluid).toHaveAttribute('data-fluid-media', 'poster');
});

test('Fluid keeps its DOM poster after WebGL loss and releases the video source on unmount', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const { fluid, video, canvas } = await openFluid(page);
  await expect(fluid).toHaveAttribute('data-fluid-media', 'video');
  await canvas.evaluate((node) => node.dispatchEvent(new Event('webglcontextlost')));
  await expect(fluid).toHaveAttribute('data-fluid-media', 'fallback');
  await expect(fluid).toHaveAttribute('data-water-ready', 'true');
  await expect(canvas).toHaveCount(0);
  await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
  expect(await fluid.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain('/assets/video/fluid-poster.webp');
  await video.evaluate((node) => { window.detachedFluidVideo = node; });
  await page.locator('.desktop-nav a[href="/about"]').dispatchEvent('click', { button: 0 });
  await expect(page.locator('#about-page-title')).toBeVisible();
  expect(await page.evaluate(() => window.detachedFluidVideo.paused && !window.detachedFluidVideo.hasAttribute('src'))).toBe(true);
});

test('Back restores the saved Playtime position instead of replaying its deep link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/playtime#dot-field');
  const experiment = page.locator('#dot-field');
  await expect(experiment).toBeAttached();
  await expect.poll(() => experiment.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(3);
  await page.evaluate(() => scrollTo({ top: 2000, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(2000);
  // The scroll listener records the browser's event before leaving this entry.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.locator('.desktop-nav a[href="/about"]').dispatchEvent('click', { button: 0 });
  await expect(page).toHaveURL('/about');
  await expect(page.locator('#about-page-title')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('/playtime#dot-field');
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
