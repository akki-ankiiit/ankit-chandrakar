import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

const destinations = [
  { name: 'Playtime', path: '/playtime', heading: 'I code for fun, here you can experience.' },
  { name: 'Design desk', path: '/desk', heading: 'A curious mind. A considered practice.' },
  { name: 'Notes', path: '/notes', heading: 'Leave a little love.' },
];

const activate = (locator, testInfo) => testInfo.project.use.hasTouch ? locator.tap() : locator.click();
// Safari's default keyboard preference skips links with Tab; Option+Tab includes them.
const tab = (page, testInfo, backwards = false) => page.keyboard.press(`${backwards ? 'Shift+' : ''}${testInfo.project.use.browserName === 'webkit' ? 'Alt+' : ''}Tab`);

async function openNavigation(page, testInfo) {
  await page.goto('/');
  const mobile = page.viewportSize().width < 750;
  if (mobile) await activate(page.getByRole('button', { name: 'Open menu', exact: true }), testInfo);
  const nav = page.getByRole('navigation', { name: mobile ? 'Mobile navigation' : 'Main navigation', exact: true, includeHidden: true });
  await expect(nav).toBeVisible();
  // Wait for the mobile menu's initial focus before starting another interaction.
  if (mobile) await expect(nav.getByRole('link', { name: 'Work', exact: true })).toBeFocused();
  return nav;
}

async function openMoreWithKeyboard(page, nav, testInfo) {
  await nav.getByRole('link', { name: 'Work', exact: true }).focus();
  for (let index = 0; index < 4; index += 1) await tab(page, testInfo);
  await expect(nav.locator('summary')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(nav.locator('details')).toHaveAttribute('open', '');
}

async function expectDestination(page, nav, destination) {
  await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
  await expect(page.getByRole('heading', { level: 1, name: destination.heading, exact: true })).toBeVisible();
  await expect(nav.locator('details')).not.toHaveAttribute('open');
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toHaveCount(0);
}

for (const [index, destination] of destinations.entries()) {
  test(`More → ${destination.name} navigates with a real pointer`, async ({ page }, testInfo) => {
    const nav = await openNavigation(page, testInfo);
    await activate(nav.locator('summary'), testInfo);
    const link = nav.getByRole('link', { name: destination.name, exact: true });
    await expect(link).toHaveAttribute('href', destination.path);
    await activate(link, testInfo);
    await expectDestination(page, nav, destination);
  });

  test(`More → ${destination.name} navigates with Enter and Tab`, async ({ page }, testInfo) => {
    const nav = await openNavigation(page, testInfo);
    await openMoreWithKeyboard(page, nav, testInfo);
    for (let step = 0; step <= index; step += 1) await tab(page, testInfo);
    await expect(nav.getByRole('link', { name: destination.name, exact: true })).toBeFocused();
    await expect(nav.locator('details')).toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expectDestination(page, nav, destination);
  });
}

test('Escape closes More and restores focus without closing the mobile menu', async ({ page }, testInfo) => {
  const nav = await openNavigation(page, testInfo);
  await openMoreWithKeyboard(page, nav, testInfo);
  await tab(page, testInfo);
  await expect(nav.getByRole('link', { name: 'Playtime', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nav.locator('details')).not.toHaveAttribute('open');
  await expect(nav.locator('summary')).toBeFocused();
  if (page.viewportSize().width < 750) {
    const menu = page.getByRole('button', { name: 'Close menu', exact: true });
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeFocused();
    await expect(nav).toBeHidden();
  }
});

test('an outside pointer dismisses More even on a non-focusable target', async ({ page }, testInfo) => {
  const nav = await openNavigation(page, testInfo);
  await activate(nav.locator('summary'), testInfo);
  await expect(nav.locator('details')).toHaveAttribute('open', '');
  await activate(page.locator('.announcement'), testInfo);
  await expect(nav.locator('details')).not.toHaveAttribute('open');
  await expect(page).toHaveURL(/\/$/);
  await expect(nav).toBeVisible();
});

test('Tab and Shift+Tab dismiss More only when focus leaves it', async ({ page }, testInfo) => {
  const nav = await openNavigation(page, testInfo);
  await openMoreWithKeyboard(page, nav, testInfo);
  await tab(page, testInfo, true);
  await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toBeFocused();
  await expect(nav.locator('details')).not.toHaveAttribute('open');

  await tab(page, testInfo);
  await page.keyboard.press('Enter');
  for (const destination of destinations) {
    await tab(page, testInfo);
    await expect(nav.getByRole('link', { name: destination.name, exact: true })).toBeFocused();
    await expect(nav.locator('details')).toHaveAttribute('open', '');
  }
  await tab(page, testInfo);
  await expect(nav.locator('details')).not.toHaveAttribute('open');
  expect(await nav.locator('details').evaluate((element) => element.contains(document.activeElement))).toBe(false);
});

test('mobile Tab wrapping keeps focus within the menu and its toggle', async ({ page }, testInfo) => {
  test.skip(page.viewportSize().width >= 750, 'The focus trap is mobile-only.');
  const nav = await openNavigation(page, testInfo);
  const menu = page.getByRole('button', { name: 'Close menu', exact: true });
  const work = nav.getByRole('link', { name: 'Work', exact: true });
  const lastLink = nav.locator('a:visible, summary:visible').last();
  await tab(page, testInfo, true);
  await expect(menu).toBeFocused();
  await tab(page, testInfo, true);
  await expect(lastLink).toBeFocused();
  await tab(page, testInfo);
  await expect(menu).toBeFocused();
  await tab(page, testInfo);
  await expect(work).toBeFocused();
});

test('modified mouse activation follows the native href in a new window', async ({ page }, testInfo) => {
  test.skip(!!testInfo.project.use.hasTouch, 'Modified mouse activation is covered by non-touch projects.');
  const nav = await openNavigation(page, testInfo);
  await nav.locator('summary').click();
  const [popup] = await Promise.all([
    page.context().waitForEvent('page'),
    nav.getByRole('link', { name: 'Design desk', exact: true }).click({ modifiers: ['Shift'] }),
  ]);
  try {
    await expect(popup).toHaveURL(/\/desk$/);
    await expect(popup.getByRole('heading', { level: 1, name: destinations[1].heading, exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  } finally {
    await popup.close();
  }
});
