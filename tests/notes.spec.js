import { test, expect } from '@playwright/test';

// Configured cases use the Vite server's real public configuration. For example:
// VITE_SUPABASE_URL=https://notes-test.supabase.co
// VITE_SUPABASE_ANON_KEY=sb_publishable_browser_test_key
// VITE_TURNSTILE_SITE_KEY=browser-test-site-key
// All API, Auth and CAPTCHA traffic below is mocked; no deployment is required.
const note = { id: 'note-1', name: 'Ada Visitor', message: 'A thoughtful little corner of the web.', approved_at: '2026-10-30T12:00:00Z' };
const pending = { ...note, email: 'private@example.com', status: 'pending', approved_at: null, created_at: '2026-10-30T12:00:00Z' };
const message = { id: 'message-1', name: 'Lin Visitor', email: 'lin@example.com', subject: 'A collaboration', message: 'Let’s make something.', status: 'unread', created_at: '2026-10-31T12:00:00Z' };
const counts = { pending: 1, approved: 0, rejected: 0, unread: 1 };

async function mockTurnstile(page) {
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: `
    (() => {
      let next = 0; const widgets = new Map();
      window.__captchaWidgets = widgets;
      window.turnstile = {
        render(element, options) {
          const id = String(++next);
          const button = document.createElement('button');
          button.type = 'button'; button.textContent = 'Complete security check';
          button.onclick = () => options.callback('mock-token-' + id);
          element.append(button); widgets.set(id, { element, options });
          setTimeout(() => { if (widgets.has(id)) options.callback('mock-token-' + id); }, 20);
          return id;
        },
        remove(id) { const widget = widgets.get(id); if (widget) widget.element.replaceChildren(); widgets.delete(id); }
      };
    })();
  ` }));
}
async function config(page) {
  return page.evaluate(async () => {
    const { backendConfigured, submissionsConfigured } = await import('/src/lib/supabase.js');
    return { backendConfigured, submissionsConfigured };
  });
}
async function openConfigured(page, path = '/notes') {
  await mockTurnstile(page);
  await page.goto(path);
  const state = await config(page);
  test.skip(path.startsWith('/admin') ? !state.backendConfigured : !state.submissionsConfigured, 'Set public Supabase and Turnstile test configuration on the Vite server to run mocked integration cases.');
}
async function fillNote(page, text = 'Thanks for the inspiration.') {
  const form = page.getByRole('form', { name: 'Leave a note', exact: true });
  await form.getByLabel('Your name').fill('Grace Visitor');
  await form.getByLabel('Your note').fill(text);
  return form;
}
async function fillContact(page, subject = 'A question') {
  const form = page.getByRole('form', { name: 'Send a message', exact: true });
  await form.getByLabel('Your name').fill('Contact Visitor');
  await form.getByLabel('Your email').fill('visitor@example.com');
  await form.getByLabel('Subject', { exact: true }).fill(subject);
  await form.getByLabel('Your message').fill('Hello from a visitor.');
  return form;
}
function json(route, data, status = 200) { return route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) }); }
function adminList(tab, rows = [pending]) { return { ...(tab === 'messages' ? { messages: [message] } : { notes: rows }), hasMore: false, counts, notificationFailures: 2 }; }

async function mockAuth(page) {
  const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'owner@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
  const encode = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.testsignature`;
  await page.route('**/auth/v1/**', (route) => {
    const url = route.request().url();
    if (url.includes('/token')) return json(route, { access_token: token, refresh_token: 'mock-refresh', expires_in: 3600, token_type: 'bearer', user });
    if (url.includes('/logout')) return json(route, {});
    return json(route, user);
  });
  return token;
}
async function login(page) {
  await page.getByLabel('Email', { exact: true }).fill('owner@example.com');
  await page.getByLabel('Password', { exact: true }).fill('mock-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

test('Notes has editorial copy, accessible navigation and truthful configuration states', async ({ page }, testInfo) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  let requests = 0;
  await page.route('**/functions/v1/portfolio-api', (route) => { requests += 1; return json(route, { notes: [], hasMore: false }); });
  await mockTurnstile(page);
  await page.goto('/notes');
  await expect(page.getByRole('heading', { name: 'Leave a Note', exact: true })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  const video = page.getByLabel('Animated illustration for the Notes page', { exact: true });
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute('src', '/assets/notes.mp4');
  await expect.poll(() => video.evaluate((element) => element.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((element) => !element.paused && element.currentTime > 0)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => video.evaluate((element) => !element.paused)).toBe(true);
  await expect(page.getByText("A little space for thoughts, feedback, or a hello. I'd love to hear from you.", { exact: true })).toBeVisible();
  await expect(page.getByText('Every note is reviewed before publication. Your email stays private.')).toBeVisible();
  const state = await config(page);
  if (!state.backendConfigured) {
    await expect(page.getByText('The notes wall is not connected yet.', { exact: false })).toBeVisible();
    expect(requests).toBe(0);
  } else await expect(page.getByText('No published notes yet.', { exact: false })).toBeVisible();
  if (!state.submissionsConfigured) {
    await expect(page.getByRole('form', { name: 'Leave a note', exact: true }).getByRole('button', { name: 'Leave a Note', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeDisabled();
  }
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Notes', exact: true })).toHaveAttribute('href', '/notes');
    await page.getByRole('button', { name: 'Close menu', exact: true }).click();
    await expect(page.locator('#mobile-navigation')).not.toBeVisible();
  } else {
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Notes', exact: true })).toHaveAttribute('href', '/notes');
  }
  expect(browserErrors).toEqual([]);
  await page.getByRole('button', { name: 'Send Message', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-form-wrap')).toHaveClass(/is-visible/);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const screenshot = testInfo.outputPath('notes-layout.png');
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  await testInfo.attach('notes-layout', { path: screenshot, contentType: 'image/png' });
});

test('public wall paginates, refreshes approvals and renders only public fields as text', async ({ page }) => {
  const offsets = [];
  let refreshed = false;
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    offsets.push(body.offset);
    return json(route, { notes: body.offset ? [{ ...note, id: 'note-2', name: 'Sam', message: '<script>never execute</script>' }] : [{ ...note, message: refreshed ? 'A newly approved note.' : note.message }], hasMore: !body.offset && !refreshed });
  });
  await openConfigured(page);
  await expect(page.getByText(note.message)).toBeVisible();
  await page.getByRole('button', { name: 'Load more notes' }).click();
  await expect(page.getByText('<script>never execute</script>', { exact: true })).toBeVisible();
  expect(offsets[0]).toBe(0);
  expect(offsets.filter((offset) => offset === 1)).toHaveLength(1);
  await expect(page.locator('.public-note')).toHaveCount(2);
  await expect(page.locator('.notes-wall')).not.toContainText('private@example.com');
  refreshed = true;
  await page.getByRole('button', { name: 'Refresh notes' }).click();
  await expect(page.getByText('A newly approved note.')).toBeVisible();
  await expect(page.locator('.public-note')).toHaveCount(1);
});

test('unconfigured admin offers no sign-in or private data requests', async ({ page }) => {
  let requests = 0;
  await page.route('**/functions/v1/portfolio-api', (route) => { requests += 1; return json(route, adminList('pending')); });
  await page.goto('/admin/notes');
  const state = await config(page);
  test.skip(state.backendConfigured, 'This case covers a server with no valid public backend configuration.');
  await expect(page.getByText('The admin connection is not configured yet. Sign-in is unavailable.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0);
  await expect(page.locator('.admin-entry')).toHaveCount(0);
  expect(requests).toBe(0);
});

test('expired CAPTCHA disables submission and each widget retries independently', async ({ page }) => {
  await page.route('**/functions/v1/portfolio-api', (route) => json(route, { notes: [], hasMore: false }));
  await openConfigured(page);
  const form = await fillNote(page);
  const submit = form.getByRole('button', { name: 'Leave a Note', exact: true });
  await expect(submit).toBeEnabled();
  await page.evaluate(() => {
    const widget = [...window.__captchaWidgets.values()].find((entry) => entry.options.action === 'portfolio-note');
    widget.options['expired-callback']();
  });
  await expect(submit).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await form.getByRole('button', { name: 'Retry security check', exact: true }).click();
  await expect(submit).toBeEnabled();
  await expect(form.getByLabel('Your note')).toHaveValue('Thanks for the inspiration.');
});

test('note validation, double-submit protection, retained retry UUID and exact success', async ({ page }) => {
  const submissions = [];
  let release;
  await page.route('**/functions/v1/portfolio-api', async (route) => {
    const body = route.request().postDataJSON();
    if (body.action === 'list-notes') return json(route, { notes: [], hasMore: false });
    submissions.push(body);
    if (submissions.length === 1) { await new Promise((resolve) => { release = resolve; }); return route.abort('failed'); }
    return json(route, { success: true });
  });
  await openConfigured(page);
  const form = await fillNote(page, '   ');
  await form.getByRole('button', { name: 'Leave a Note', exact: true }).click();
  await expect(form.getByText('Enter a message of up to 500 characters.')).toBeVisible();
  expect(submissions).toHaveLength(0);
  await form.getByLabel('Your note').fill('  Thanks for the inspiration.  ');
  await expect(form.getByText(`${Array.from('  Thanks for the inspiration.  ').length} / 500`, { exact: true })).toBeVisible();
  await form.getByLabel('Email (optional, kept private)').fill('bad-email');
  await form.getByRole('button', { name: 'Leave a Note', exact: true }).click();
  await expect(form.getByText('Enter a valid email address of up to 254 characters.')).toBeVisible();
  await form.getByLabel('Email (optional, kept private)').fill('');
  await form.getByRole('button', { name: 'Leave a Note', exact: true }).click();
  await expect(form.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await form.evaluate((element) => { element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  await expect.poll(() => submissions.length).toBe(1);
  release();
  await expect(form.getByText('Something went wrong. Please try again.', { exact: true })).toBeVisible();
  await form.getByRole('button', { name: 'Leave a Note', exact: true }).click();
  await expect(form.getByText('Thanks for leaving a note! Your message has been submitted and is awaiting approval.', { exact: true })).toBeVisible();
  expect(submissions).toHaveLength(2);
  expect(submissions[0].idempotencyKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  expect(submissions[1].idempotencyKey).toBe(submissions[0].idempotencyKey);
  expect(submissions[1].captchaToken).not.toBe(submissions[0].captchaToken);
  expect(submissions[0].message).toBe('Thanks for the inspiration.');
  expect(submissions[0].botcheck).toBe('');
  await expect(form.getByLabel('Your note')).toHaveValue('');
});

test('contact sends subject and validated private message via backend', async ({ page }) => {
  let sent;
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    if (body.action === 'submit-message') { sent = body; return json(route, { success: true }); }
    return json(route, { notes: [], hasMore: false });
  });
  await openConfigured(page);
  const form = page.getByRole('form', { name: 'Send a message', exact: true });
  await form.getByLabel('Your name').fill('  Contact Visitor  ');
  await form.getByLabel('Your email').fill('visitor@example.com');
  await form.getByLabel('Subject', { exact: true }).fill('   ');
  await form.getByLabel('Your message').fill('  Hello there  ');
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(form.getByText('Enter a subject of up to 150 characters.')).toBeVisible();
  await form.getByLabel('Subject', { exact: true }).fill('  Hello  ');
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(form.getByText('Your message has been sent. Thanks for reaching out!', { exact: true })).toBeVisible();
  expect(sent).toMatchObject({ action: 'submit-message', name: 'Contact Visitor', subject: 'Hello', message: 'Hello there', email: 'visitor@example.com', botcheck: '' });
  const actions = await page.evaluate(() => [...window.__captchaWidgets.values()].map((widget) => widget.options.action));
  expect(actions.sort()).toEqual(['portfolio-message', 'portfolio-note']);
});

const submissionErrors = [
  {
    status: 409,
    serverMessage: 'This submission was already received, or its request ID was reused. Please wait before trying again.',
    feedback: 'This submission was already received, or its request ID was reused. Please wait before trying again.',
  },
  {
    status: 429,
    serverMessage: 'Too many submissions. Please try again in ten minutes.',
    feedback: 'Too many submissions. Please try again in ten minutes.',
  },
  {
    status: 403,
    serverMessage: 'Verification failed. Please complete the security check again.',
    feedback: 'Verification failed. Please complete the security check again. If it still fails, try again later.',
  },
  {
    status: 503,
    serverMessage: 'Verification is temporarily unavailable. Please try again.',
    feedback: 'Verification is temporarily unavailable. Please try again later.',
  },
  {
    status: 400,
    serverMessage: 'Please enter a valid email address.',
    feedback: 'Please enter a valid email address.',
  },
];

for (const { status, serverMessage, feedback } of submissionErrors) {
  test(`HTTP ${status} gives safe note feedback and separate actionable contact hints on repeated requests`, async ({ page }) => {
    const contacts = [];
    await page.route('**/functions/v1/portfolio-api', (route) => {
      const body = route.request().postDataJSON();
      if (body.action === 'list-notes') return json(route, { notes: [], hasMore: false });
      if (body.action === 'submit-message') {
        contacts.push(body);
        if (body.subject === 'A new question') return json(route, { success: true });
      }
      return json(route, { error: serverMessage }, status);
    });
    await openConfigured(page);
    const noteForm = await fillNote(page);
    await noteForm.getByRole('button', { name: 'Leave a Note', exact: true }).click();
    await expect(noteForm.getByText(feedback, { exact: true })).toBeVisible();
    await expect(noteForm.getByLabel('Your note')).toHaveValue('Thanks for the inspiration.');

    const form = await fillContact(page);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await form.getByRole('button', { name: 'Send Message', exact: true }).click();
      await expect.poll(() => contacts.length).toBe(attempt + 1);
      await expect(form.locator('.form-status')).toHaveText('Something went wrong. Please try again.');
      await expect(form.locator('.submission-hint')).toHaveText(feedback);
      await expect(form.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
      await expect(form.getByLabel('Your message')).toHaveValue('Hello from a visitor.');
    }
    expect(contacts[1].idempotencyKey).toBe(contacts[0].idempotencyKey);
    expect(contacts[1].captchaToken).not.toBe(contacts[0].captchaToken);
    await form.getByLabel('Subject', { exact: true }).fill('A new question');
    await expect(form.locator('.submission-hint')).toHaveCount(0);
    await form.getByRole('button', { name: 'Send Message', exact: true }).click();
    await expect(form.locator('.form-status')).toHaveText('Your message has been sent. Thanks for reaching out!');
    expect(contacts[2].idempotencyKey).not.toBe(contacts[1].idempotencyKey);
    await expect(form.locator('.submission-hint')).toHaveCount(0);
  });
}

test('repeating an accepted contact message shows a conflict instead of pretending it was delivered again', async ({ page }) => {
  const contacts = [];
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    if (body.action === 'list-notes') return json(route, { notes: [], hasMore: false });
    contacts.push(body);
    return contacts.length === 1 ? json(route, { success: true }) : json(route, { error: submissionErrors[0].serverMessage }, 409);
  });
  await openConfigured(page);
  const form = await fillContact(page);
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(form.locator('.form-status')).toHaveText('Your message has been sent. Thanks for reaching out!');
  await expect(form.getByLabel('Your name')).toHaveValue('');
  await fillContact(page);
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(form.locator('.form-status')).toHaveText('Something went wrong. Please try again.');
  await expect(form.locator('.submission-hint')).toHaveText(submissionErrors[0].feedback);
  await expect(form.getByRole('button', { name: 'Send Message', exact: true })).toBeEnabled();
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect.poll(() => contacts.length).toBe(3);
  await expect(form.locator('.submission-hint')).toHaveText(submissionErrors[0].feedback);
  expect(contacts[1].idempotencyKey).not.toBe(contacts[0].idempotencyKey);
  expect(contacts[2].idempotencyKey).toBe(contacts[1].idempotencyKey);
  expect(contacts[2].captchaToken).not.toBe(contacts[1].captchaToken);
  await expect(form.locator('.form-status')).not.toHaveText('Your message has been sent. Thanks for reaching out!');
});

test('unknown submission error text is never rendered in either form', async ({ page }) => {
  let status = 400;
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    if (body.action === 'list-notes') return json(route, { notes: [], hasMore: false });
    return json(route, { error: 'Private provider credentials and database exception' }, status);
  });
  await openConfigured(page);
  const noteForm = await fillNote(page);
  await noteForm.getByRole('button', { name: 'Leave a Note', exact: true }).click();
  await expect(noteForm.locator('.form-status')).toHaveText('Please check your submission and try again.');
  const form = await fillContact(page);
  status = 500;
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(form.locator('.form-status')).toHaveText('Something went wrong. Please try again.');
  await expect(form.locator('.submission-hint')).toHaveCount(0);
  await expect(page.getByText('Private provider credentials and database exception', { exact: false })).toHaveCount(0);
});

test('empty and whitespace-only notes are blocked and the live limit caps at 500 Unicode characters', async ({ page }) => {
  const submissions = [];
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    if (body.action === 'list-notes') return json(route, { notes: [], hasMore: false });
    submissions.push(body);
    return json(route, { success: true });
  });
  await openConfigured(page);
  const form = page.getByRole('form', { name: 'Leave a note', exact: true });
  const submit = form.getByRole('button', { name: 'Leave a Note', exact: true });
  const name = form.getByLabel('Your name');
  const text = form.getByLabel('Your note');
  await submit.click();
  await expect(form.getByText('Enter a name of up to 100 characters.')).toBeVisible();
  await expect(form.getByText('Enter a message of up to 500 characters.')).toBeVisible();
  await expect(name).toBeFocused();
  await name.fill('   ');
  await text.fill('A real message.');
  await submit.click();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toBeFocused();
  expect(submissions).toHaveLength(0);
  await name.fill('  Valid Visitor  ');
  await text.fill('   ');
  await submit.click();
  await expect(text).toHaveAttribute('aria-invalid', 'true');
  await expect(text).toBeFocused();
  expect(submissions).toHaveLength(0);
  await text.fill('x'.repeat(501));
  await expect(text).toHaveValue('x'.repeat(500));
  await expect(form.getByText('500 / 500', { exact: true })).toBeVisible();
  await text.fill('🌱'.repeat(501));
  await expect(text).toHaveValue('🌱'.repeat(500));
  await expect(form.getByText('500 / 500', { exact: true })).toBeVisible();
  await submit.click();
  await expect(form.locator('.form-status')).toHaveText('Thanks for leaving a note! Your message has been submitted and is awaiting approval.');
  expect(submissions).toHaveLength(1);
  expect(submissions[0].name).toBe('Valid Visitor');
  expect(Array.from(submissions[0].message)).toHaveLength(500);
});

test('public wall failure offers retry without fabricated entries', async ({ page }) => {
  let fail = true;
  await page.route('**/functions/v1/portfolio-api', (route) => fail ? json(route, { error: 'Internal database secret text' }, 500) : json(route, { notes: [note], hasMore: false }));
  await openConfigured(page);
  await expect(page.getByRole('button', { name: 'Retry notes' })).toBeVisible();
  await expect(page.locator('.notes-wall')).not.toContainText('Internal database secret text');
  await expect(page.locator('.public-note')).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'Retry notes' }).click();
  await expect(page.getByText(note.message)).toBeVisible();
});

test('admin requests require login, supports moderation, messages and notification retry', async ({ page }) => {
  const token = await mockAuth(page);
  const actions = [];
  let approved = false;
  let messageStatus = 'unread';
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    actions.push(body);
    expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
    if (body.action === 'list-admin') return json(route, body.tab === 'messages' ? { ...adminList('messages'), messages: [{ ...message, status: messageStatus }] } : adminList(body.tab, approved ? [] : [pending]));
    if (body.action === 'moderate-note') approved = true;
    if (body.action === 'update-message') messageStatus = body.status;
    if (body.action === 'retry-notifications') return json(route, { sent: 1, failed: 1 });
    return json(route, { success: true });
  });
  await openConfigured(page, '/admin/notes');
  await expect(page.getByRole('heading', { name: 'Owner sign in' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(actions).toHaveLength(0);
  await login(page);
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  await expect(page.getByText('private@example.com', { exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  expect(actions.some((action) => action.action === 'delete-note')).toBe(false);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByText('No pending notes here.')).toBeVisible();
  expect(actions.some((action) => action.action === 'moderate-note' && action.status === 'approved')).toBe(true);
  await page.getByRole('button', { name: /messages 1 unread/i }).click();
  await expect(page.getByRole('heading', { name: message.subject })).toBeVisible();
  await page.getByRole('button', { name: 'Mark read', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mark unread', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Retry notifications', exact: true }).click();
  await expect(page.getByText('Notification retry: 1 sent, 1 failed.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Owner sign in' })).toBeVisible();
  await expect(page.getByText(message.message, { exact: true })).toHaveCount(0);
});

test('reject and permanent delete require confirmation and refresh the affected folders', async ({ page }) => {
  await mockAuth(page);
  let row = { ...pending };
  const actions = [];
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    actions.push(body);
    if (body.action === 'moderate-note') row = { ...row, status: body.status };
    if (body.action === 'delete-note') row = null;
    if (body.action === 'list-admin') return json(route, {
      ...adminList(body.tab, row?.status === body.tab ? [row] : []),
      counts: { ...counts, pending: row?.status === 'pending' ? 1 : 0, rejected: row?.status === 'rejected' ? 1 : 0 },
    });
    return json(route, { success: true });
  });
  await openConfigured(page, '/admin/notes');
  await login(page);
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Reject', exact: true }).click();
  expect(actions.some((action) => action.action === 'moderate-note')).toBe(false);
  await expect(page.locator('.admin-entry')).toHaveCount(1);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reject', exact: true }).click();
  await expect(page.getByText('No pending notes here.', { exact: true })).toBeVisible();
  expect(actions.find((action) => action.action === 'moderate-note')).toMatchObject({ id: pending.id, status: 'rejected' });
  await page.getByRole('button', { name: /^rejected 1$/i }).click();
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  expect(actions.some((action) => action.action === 'delete-note')).toBe(false);
  page.once('dialog', (dialog) => { expect(dialog.message()).toContain('cannot be undone'); return dialog.accept(); });
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('No rejected notes here.', { exact: true })).toBeVisible();
  await expect(page.locator('.admin-entry')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^rejected 0$/i })).toBeVisible();
  expect(actions.find((action) => action.action === 'delete-note')).toMatchObject({ id: pending.id });
  expect(actions.filter((action) => action.action === 'list-admin' && action.tab === 'rejected')).toHaveLength(2);
});

test('backend denial never exposes an inbox to an authenticated non-owner', async ({ page }) => {
  await mockAuth(page);
  await page.route('**/functions/v1/portfolio-api', (route) => json(route, { error: 'Forbidden' }, 403));
  await openConfigured(page, '/admin/notes');
  await login(page);
  await expect(page.getByText('Access denied. This account is not authorized to manage the portfolio.', { exact: true })).toBeVisible();
  await expect(page.locator('.admin-entry')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retry notifications', exact: true })).toHaveCount(0);
});

test('admin pagination advances the offset and changing folders clears stale entries', async ({ page }) => {
  await mockAuth(page);
  const offsets = [];
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    offsets.push([body.tab, body.offset]);
    if (body.tab === 'approved') return json(route, adminList(body.tab, []));
    return json(route, { ...adminList(body.tab, body.offset ? [{ ...pending, id: 'note-2', name: 'Second Visitor' }] : [pending]), hasMore: !body.offset });
  });
  await openConfigured(page, '/admin/notes');
  await login(page);
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Load more entries', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Second Visitor', exact: true })).toBeVisible();
  await expect(page.locator('.admin-entry')).toHaveCount(2);
  await page.getByRole('button', { name: /^approved /i }).click();
  await expect(page.getByText('No approved notes here.', { exact: true })).toBeVisible();
  await expect(page.locator('.admin-entry')).toHaveCount(0);
  expect(offsets).toEqual([['pending', 0], ['pending', 1], ['approved', 0]]);
});

test('late admin response cannot restore private rows after logout', async ({ page }) => {
  await mockAuth(page);
  let release;
  let first = true;
  await page.route('**/functions/v1/portfolio-api', async (route) => {
    if (first) { first = false; return json(route, adminList('pending')); }
    await new Promise((resolve) => { release = resolve; });
    return json(route, adminList('pending'));
  });
  await openConfigured(page, '/admin/notes');
  await login(page);
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh inbox', exact: true }).click();
  await expect.poll(() => Boolean(release)).toBe(true);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  release();
  await expect(page.getByRole('heading', { name: 'Owner sign in' })).toBeVisible();
  await expect(page.locator('.admin-entry')).toHaveCount(0);
  await expect(page.getByText('private@example.com', { exact: true })).toHaveCount(0);
});

test('safe polling announces counts without replacing entries in the current view', async ({ page }) => {
  await mockAuth(page);
  let pollCount = 0;
  await page.route('**/functions/v1/portfolio-api', (route) => {
    const body = route.request().postDataJSON();
    if (body.limit === 1) { pollCount += 1; return json(route, { ...adminList(body.tab, []), counts: { ...counts, pending: 2, unread: 2 } }); }
    return json(route, adminList(body.tab));
  });
  await openConfigured(page, '/admin/notes');
  await page.clock.install();
  await login(page);
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  await page.clock.fastForward(46000);
  await expect.poll(() => pollCount).toBe(1);
  await expect(page.getByText('1 new pending note. 1 new unread message. Refresh to load the latest entries.', { exact: true })).toBeVisible();
  await expect(page.getByText(pending.message, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /pending 2/i })).toBeVisible();
});
