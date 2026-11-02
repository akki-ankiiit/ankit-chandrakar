import { test, expect } from '@playwright/test';

const studies = [
  ['ContractorBhai', '/work/contractorbhai'],
  ['Adhikar', '/work/adhikar-brand'],
  ['Atlas', '/work/atlas-brand'],
  ['ThanQ', '/work/thanq'],
];

for (const [name, route] of studies) {
  test(`${name} shares compact presentation controls and fits slides`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const isThanQ = name === 'ThanQ';
    const prefix = isThanQ ? 'tq-' : '';
    const frame = page.frameLocator(isThanQ ? '.thanq-guidelines-frame' : '.cb-presentation');
    const control = (id) => frame.locator(`#${prefix}${id}`);
    const mode = control('all-slides');
    await expect(mode).toBeVisible({ timeout: 30000 });
    if (await mode.getAttribute('aria-pressed') === 'true') await mode.click();
    await expect(mode).toHaveAttribute('aria-pressed', 'false');
    await expect(frame.locator('body')).toHaveCSS('background-color', 'rgb(253, 253, 245)');
    await expect(control('toolbar')).toHaveCSS('background-color', 'rgb(253, 253, 245)');
    const back = page.locator('.project-back-link').first();
    await expect(back).toHaveAccessibleName(/Back to /);
    await expect(back).toHaveText('');
    await expect(back).toHaveCSS('border-radius', '50%');
    expect(await back.evaluate((element) => element.clientWidth === element.clientHeight)).toBe(true);

    expect(await page.locator(isThanQ ? '.thanq-guidelines-presentation' : '.cb-page').evaluate((element) => {
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const frame = element.querySelector('iframe').getBoundingClientRect();
      return element.getBoundingClientRect().bottom <= innerHeight + 1 && frame.top >= header.bottom + 28;
    })).toBe(true);

    const bounds = await frame.locator('body').evaluate((_, { isThanQ, prefix }) => {
      const slide = document.querySelector(isThanQ ? '.frame.tq-current' : '.slide.current').getBoundingClientRect();
      const toolbarElement = document.querySelector(`#${prefix}toolbar`);
      const toolbar = toolbarElement.getBoundingClientRect();
      const button = document.querySelector(`#${prefix}next`).getBoundingClientRect();
      return {
        fits: slide.left >= -1 && slide.right <= innerWidth + 1 && slide.top >= 0 && slide.bottom <= toolbar.top + 1,
        controlsFit: toolbar.left >= 0 && toolbar.right <= innerWidth && toolbar.bottom <= innerHeight,
        contentFits: toolbarElement.scrollWidth <= toolbarElement.clientWidth,
        centered: Math.abs((toolbar.left + toolbar.right) / 2 - innerWidth / 2) <= 1,
        buttonHeight: button.height,
        paddingTop: parseFloat(getComputedStyle(document.querySelector(isThanQ ? '.deck' : '#viewport')).paddingTop),
        slideWidth: slide.width,
      };
    }, { isThanQ, prefix });
    expect(bounds.fits).toBe(true);
    expect(bounds.controlsFit).toBe(true);
    expect(bounds.contentFits).toBe(true);
    expect(bounds.centered).toBe(true);
    expect(bounds.buttonHeight).toBeLessThanOrEqual(44);
    expect(bounds.paddingTop).toBeGreaterThanOrEqual(16);
    if (testInfo.project.name === 'desktop') expect(bounds.slideWidth).toBeGreaterThan(1100);

    await expect(control('previous')).toBeDisabled();
    await control('next').click();
    await expect(control('counter')).toHaveText(/^02 \/ /);
    await control('previous').click();
    await expect(control('counter')).toHaveText(/^01 \/ /);
    await control('contents').click();
    await expect(control('slide-index')).toBeVisible();
    await control('close-index').click();
    await expect(control('slide-index')).not.toBeVisible();
    await mode.click();
    await expect(mode).toHaveAttribute('aria-pressed', 'true');
    await expect(frame.locator('body')).toHaveCSS('background-color', 'rgb(253, 253, 245)');
    await mode.click();
    await expect(mode).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({ path: testInfo.outputPath('presentation.png') });
    expect(errors).toEqual([]);
  });
}
