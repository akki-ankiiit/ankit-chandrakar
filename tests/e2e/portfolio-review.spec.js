import { test, expect } from '@playwright/test';

const projects = [
  ['neostra-dsar', 'Neostra · Data Subject Access Request'],
  ['neostra-system', 'Neostra design system'],
  ['neostra-cpmp', 'Neostra · CPMP'],
  ['helix', 'Helix Labs'],
  ['contractorbhai', 'ContractorBhai'],
  ['atlas-brand', 'Atlas'],
  ['adhikar-brand', 'Adhikar'],
  ['yesbot', 'YesBot.ai'],
  ['cryptotax', 'CryptoTax'],
];

test('a hiring visitor can find flagship work, download the intended résumé, and contact Ankit', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Product Designer for complex SaaS and AI workflows.');
  await expect(page.locator('.hero-name')).toHaveText('Ankit Chandrakar');
  const download = page.locator('.hiring-hero a[download]');
  const pdf = await request.get(await download.getAttribute('href'));
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await expect(page.locator('.hero-email')).toHaveAttribute('href', 'mailto:chandrakarankit014@gmail.com');
  await page.getByRole('link', { name: 'View selected work', exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  expect(await page.locator('#work-panel > .gallery-transition > .portfolio-grid [data-project-link]').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual([
    '/work/neostra-dsar', '/work/helix', '/work/contractorbhai', '/work/atlas-brand', '/work/adhikar-brand',
  ]);
  await page.locator('[data-project-link="neostra-dsar"]').click();
  await expect(page.locator('h1')).toHaveText('Neostra · Data Subject Access Request');
  await page.locator('.project-back-link').first().click();
  await expect(page.locator('[data-project-link="neostra-dsar"]')).toBeFocused();
});

test('navigation works by keyboard and metadata follows client navigation', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
  const mobile = await toggle.isVisible();
  if (mobile) {
    await toggle.click();
    await expect(page.locator('#mobile-navigation a').first()).toBeFocused();
  }
  const nav = page.getByRole('navigation', { name: mobile ? 'Mobile navigation' : 'Main navigation', exact: true });
  await nav.locator('summary').press('Enter');
  await expect(nav.getByRole('link', { name: 'Playtime', exact: true })).toBeVisible();
  await nav.locator('summary').press('Escape');
  await expect(nav.locator('summary')).toBeFocused();
  if (mobile) {
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await toggle.click();
  }
  await nav.getByRole('link', { name: 'Résumé', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('My Resume');
  await expect(page.locator('.resume-sheet')).toBeVisible();
  await page.locator('.resume-transcript > summary').press('Enter');
  await expect(page.locator('.resume-transcript')).toContainText('WORK EXPERIENCE');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ankit.devs.surf/resume');
});

test('project stories are readable without embeds, expose evidence, and fit the viewport', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, title] of projects) {
    await page.goto(`/work/${route}`);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('.project-overview__summary')).toBeVisible();
    await expect(page.locator('.project-overview h2').first()).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
      return ids.length === new Set(ids).size;
    })).toBe(true);
    const figure = page.locator('.project-overview__figure img').first();
    await figure.scrollIntoViewIfNeeded();
    await expect.poll(() => figure.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('private review inputs are not served while public artifacts remain available', async ({ request }) => {
  for (const route of [
    '/ankit-remote-job-report.pdf', '/public/ankit-remote-job-report.pdf',
    '/docs/private/portfolio-content-gaps.md',
    '/@fs/Users/akki/Documents/myport/ankit-chandrakar/docs/private/portfolio-content-gaps.md',
  ]) expect((await request.get(route)).status()).toBe(404);
  expect((await request.get('/assets/portfolio-evidence/neostra-requests.webp')).status()).toBe(200);
});

test('opening a shared project and moving to About replaces project-specific metadata', async ({ page }) => {
  await page.route('**/work/helix', async route => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://ankit.devs.surf/work/helix" />')
      .replace(/<meta property="og:title"[^>]*>/, '<meta property="og:title" content="Helix shared project" />');
    await route.fulfill({response,body});
  });
  await page.goto('/work/helix');
  const menu = page.getByRole('button', {name:'Open menu',exact:true});
  const isMobile = await menu.isVisible();
  if (isMobile) await menu.click();
  await page.getByRole('navigation', {name:isMobile?'Mobile navigation':'Main navigation',exact:true}).getByRole('link',{name:'About',exact:true}).click();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ankit.devs.surf/about');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'About — Ankit Chandrakar · Product Designer');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Product design experience/);
});

test('a screen can be inspected by keyboard and the presentation restores its trigger', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/work/contractorbhai');
  await page.locator('.cb-reading-presentation > summary').click();
  await page.locator('.cb-presentation').scrollIntoViewIfNeeded();
  const frame=page.frameLocator('.cb-presentation');
  const trigger=frame.locator('.slide.current [data-inspect]').first();
  await trigger.press('Enter');
  await expect(frame.locator('#inspector')).toBeVisible();
  await expect(frame.locator('#inspected-image')).toHaveAttribute('alt', /reminders/);
  await frame.locator('#actual-image').click();
  await expect(frame.locator('#actual-image')).toHaveAttribute('aria-pressed','true');
  await frame.locator('#close-inspector').press('Escape');
  await expect(frame.locator('#inspector')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
