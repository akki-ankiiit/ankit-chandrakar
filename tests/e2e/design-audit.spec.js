import { test, expect } from '@playwright/test';

const routes = ['neostra-dsar', 'neostra-cpmp', 'neostra-system', 'helix', 'contractorbhai', 'atlas-brand', 'adhikar-brand', 'yesbot', 'cryptotax', 'neostra', 'thanq', 'kamdhenu-k-series', 'bondure', 'shinex-crystalx'];

test.beforeEach(async ({page}) => { await page.emulateMedia({reducedMotion:'reduce'}); });

test('project families share a compact aligned navigation rail and smaller readable titles', async ({page}) => {
  let rail;
  for (const route of routes) {
    await page.goto(`/work/${route}`);
    const back = page.locator('.project-back-link').first();
    await expect(back).toBeVisible();
    const box = await back.boundingBox();
    const gap = await back.evaluate(element => element.getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().bottom);
    if (rail === undefined) rail = box.x;
    expect(Math.abs(box.x - rail), route).toBeLessThan(1);
    expect(gap, route).toBe(page.viewportSize().width < 750 ? 16 : 20);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    const title = page.locator('.project-overview h1');
    if (await title.count()) {
      expect(await title.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(40);
      expect(Math.abs((await title.boundingBox()).x - box.x), route).toBeLessThan(1);
    }
  }
});

test('phone mockups use actual slide exports at restrained sizes and retain full-size access', async ({page}) => {
  for (const route of ['contractorbhai', 'adhikar-brand']) {
    await page.goto(`/work/${route}`);
    const phones = page.locator('.project-overview__figure--portrait');
    await expect(phones.first()).toBeVisible();
    expect(await phones.count()).toBeGreaterThan(0);
    for (const phone of await phones.all()) {
      const image = phone.locator('img');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      expect((await image.boundingBox()).height).toBeLessThanOrEqual(page.viewportSize().width < 600 ? 420 : 520);
      await expect(phone.locator('figcaption a')).toHaveAttribute('target', '_blank');
      if (route === 'contractorbhai') await expect(image).toHaveAttribute('src', /ContractorBhai\/slide-mockups\//);
    }
  }
  await page.goto('/work/neostra-dsar');
  await expect(page.locator('.project-overview__figure img').first()).toHaveAttribute('src', /neostra-requests-clean.webp$/);
  await expect(page.locator('.project-overview__figure figcaption').first()).toContainText('sample data');
});

test('work and contact anchor navigation keep the next keyboard action at their destination', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name:'View selected work', exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#work')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('#work'))).toBe(true);
  const menu = page.getByRole('button', {name:'Open menu', exact:true});
  const mobile = await menu.isVisible();
  if (mobile) { await menu.focus(); await menu.press('Enter'); }
  const nav = page.getByRole('navigation', {name:mobile?'Mobile navigation':'Main navigation',exact:true});
  const contact = nav.getByRole('link', {name:'Contact',exact:true});
  await contact.focus();
  await contact.press('Enter');
  await expect(page.locator('#footer')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('#footer'))).toBe(true);
});

test('trailing-slash Playtime links keep page identity and restore their experiment anchor', async ({page}) => {
  await page.goto('/playtime/#dot-field');
  await expect(page).toHaveTitle('Playtime — Ankit Chandrakar');
  const target=page.locator('#dot-field');
  await expect(target).toBeAttached();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  await expect(target).toBeFocused();
});

test('a failed route module preserves the site and brings recovery into view and focus', async ({page}) => {
  await page.goto('/');
  await page.locator('#footer').scrollIntoViewIfNeeded();
  await page.route('**/src/pages/AboutPage.jsx*', route => route.abort());
  await page.locator('.footer-page-links').getByRole('link', {name:'About',exact:true}).click();
  const heading=page.getByRole('heading', {name:'This page couldn’t load.',exact:true});
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(page.locator('.site-header')).toBeVisible();
  expect((await heading.boundingBox()).y).toBeGreaterThan(0);
  await page.locator('.route-error').getByRole('link', {name:'Back to the portfolio'}).click();
  await expect(page.locator('h1')).toHaveText('Product Designer for complex SaaS and AI workflows.');
});

test('a missing project has its own page metadata and recovery links', async ({page}) => {
  await page.goto('/work/design-review-missing');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Ankit Chandrakar');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ankit.devs.surf/work/design-review-missing');
  await page.getByRole('link', {name:'Browse selected work'}).click();
  await expect(page.locator('#work')).toBeFocused();
});
