// Async mocks intentionally implement the real promise-returning boundaries.
// deno-lint-ignore-file require-await
import {
  ApiError, authorize, clientIp, createHandler, deliverNotifications, keyedHash, loadConfig, notification,
  pagination, publicProjection, readBody, validateSubmission, verifyCaptcha,
  type Config, type Outbox, type Repository,
} from "../../supabase/functions/portfolio-api/core.ts";

// No test libraries/dependencies needed; run with `deno test tests/backend`.
function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw new Error(message);
}
function equal(actual: unknown, expected: unknown) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
async function rejects(fn: () => unknown | Promise<unknown>, status?: number) {
  try { await fn(); } catch (error) {
    if (status) assert(error instanceof ApiError && error.status === status, `Expected status ${status}`);
    return;
  }
  throw new Error("Expected rejection");
}
const key = "6d755f24-b689-4f7b-8763-92747d7f620a";
const config: Config = {
  origins: new Set(["https://portfolio.example", "http://localhost:5173"]),
  captchaHosts: new Set(["portfolio.example"]), turnstileSecret: "secret",
  hashSecret: "01234567890123456789012345678901", ipHeader: "x-forwarded-for", ipIndex: -1,
  localBypass: false, resendKey: "resend-secret", resendFrom: "Portfolio <hello@example.com>",
  ownerEmail: "chandrakarankit014@gmail.com", siteUrl: "https://portfolio.example",
};
const input = { name: "  Ada  ", email: " ADA@Example.com ", message: " Hello! ", botcheck: "", captchaToken: "test-token", idempotencyKey: key };
function repository(overrides: Partial<Repository> = {}): Repository {
  return {
    publicNotes: async () => [], user: async () => null, isAdmin: async () => false,
    consumeRate: async () => true, submit: async () => ({ outcome: "created" }),
    adminRows: async () => [], counts: async () => ({ pending: 1, approved: 2, rejected: 3, unread: 4, notificationFailures: 5 }),
    moderate: async () => true, deleteNote: async () => true, updateMessage: async () => true,
    claim: async () => [], finish: async () => true, ...overrides,
  };
}
function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://backend.example/functions/v1/portfolio-api", {
    method: "POST", headers: { "Content-Type": "application/json", "X-Forwarded-For": "192.0.2.1", ...headers }, body: JSON.stringify(body),
  });
}
const captchaFetch = ((_: unknown, options?: RequestInit) => {
  const params = options?.body as URLSearchParams;
  assert(params.get("secret") === "secret");
  assert(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-8[a-f0-9]{3}-[a-f0-9]{12}$/.test(params.get("idempotency_key") || ""));
  return Promise.resolve(new Response(JSON.stringify({ success: true, hostname: "portfolio.example", action: "portfolio-note" })));
}) as typeof fetch;

Deno.test("submission validation trims, normalizes email, preserves multiline text, enforces exact boundaries", async () => {
  const value = validateSubmission(input, "note");
  equal([value.name, value.email, value.message, value.subject], ["Ada", "ada@example.com", "Hello!", null]);
  equal(validateSubmission({ ...input, email: "   " }, "note").email, null);
  equal(validateSubmission({ ...input, message: "😀".repeat(500) }, "note").message.length, 1000);
  for (const changed of [{ message: "a".repeat(501) }, { name: "a".repeat(101) }, { email: "a@b" }, { message: "\u0000bad" }, { name: "a\nb" }, { idempotencyKey: "invalid" }, { botcheck: "bot" }, { botcheck: undefined }, { captchaToken: "" }, { message: "  " }, { name: 123 }]) {
    await rejects(() => validateSubmission({ ...input, ...changed }, "note"), 400);
  }
  const contact = { ...input, subject: "  Hi  ", message: "line 1\nline 2" };
  equal(validateSubmission(contact, "message").subject, "Hi");
  equal(validateSubmission({ ...contact, subject: "s".repeat(150), message: "m".repeat(5000) }, "message").message.length, 5000);
  for (const changed of [{ email: "" }, { subject: "s".repeat(151) }, { message: "m".repeat(5001) }, { subject: undefined }]) {
    await rejects(() => validateSubmission({ ...contact, ...changed }, "message"), 400);
  }
});

Deno.test("pagination defaults and denial of abusive or ambiguous pages", async () => {
  equal(pagination({}, 12), { offset: 0, limit: 12 });
  for (const body of [{ limit: 0 }, { limit: 101 }, { offset: -1 }, { offset: 0.5 }, { limit: "12" }, { offset: 100001 }]) await rejects(() => pagination(body, 12), 400);
});

Deno.test("public projection and list response never leak private base columns", async () => {
  const row = { id: key, name: "Ada", message: "Hi", approved_at: "2026-11-01T00:00:00Z", email: "private@example.com", status: "approved", approved_by: "private" };
  equal(Object.keys(publicProjection(row)), ["id", "name", "message", "approved_at"]);
  const handler = createHandler(repository({ publicNotes: async (offset, limit) => {
    equal([offset, limit], [0, 2]); return [row, row];
  } }), config);
  const response = await handler(request({ action: "list-notes", limit: 1 }));
  const body = await response.json();
  assert(body.hasMore && body.notes.length === 1);
  assert(!JSON.stringify(body).includes("private"));
});

Deno.test("CORS denies unknown and null origins before DB access, allows configured preflight and no-Origin POST", async () => {
  let calls = 0;
  const handler = createHandler(repository({ publicNotes: async () => { calls++; return []; } }), config);
  for (const origin of ["https://evil.example", "null", "https://portfolio.example.evil.example"]) {
    const res = await handler(request({ action: "list-notes" }, { Origin: origin }));
    equal(res.status, 403); assert(!res.headers.has("access-control-allow-origin"));
  }
  equal(calls, 0);
  const preflight = await handler(new Request("https://backend.example", { method: "OPTIONS", headers: { Origin: "https://portfolio.example" } }));
  equal(preflight.status, 204); equal(preflight.headers.get("access-control-allow-origin"), "https://portfolio.example");
  equal((await handler(request({ action: "list-notes" }))).status, 200);
  equal((await handler(new Request("https://backend.example", { method: "GET" }))).status, 405);
});

Deno.test("body validation measures streamed UTF-8 bytes and rejects wrong media/encoding/JSON", async () => {
  await rejects(() => readBody(new Request("https://example.com", { method: "POST", body: "{}" })), 415);
  await rejects(() => readBody(request([])), 400);
  await rejects(() => readBody(request(null)), 400);
  await rejects(() => readBody(request({ a: "😀".repeat(9000) })), 413);
  await rejects(() => readBody(request({}, { "content-encoding": "gzip" })), 415);
  await rejects(() => readBody(new Request("https://example.com", { method: "POST", headers: { "content-type": "application/json" }, body: "{" })), 400);
});

Deno.test("all privileged actions require remote user validation and the UUID allowlist", async () => {
  const actions = ["list-admin", "moderate-note", "delete-note", "update-message", "retry-notifications"];
  for (const action of actions) {
    let writes = 0;
    const repo = repository({ user: async (token) => { equal(token, "forged"); return null; }, moderate: async () => { writes++; return true; } });
    const handler = createHandler(repo, config);
    equal((await handler(request({ action, id: key, status: "approved", tab: "pending" }))).status, 401);
    equal((await handler(request({ action, id: key, status: "approved", tab: "pending" }, { Authorization: "Bearer forged" }))).status, 401);
    equal(writes, 0);
  }
  const req = request({}, { Authorization: "Bearer real" });
  await rejects(() => authorize(req, repository({ user: async () => key, isAdmin: async () => false })), 403);
  equal(await authorize(req, repository({ user: async () => key, isAdmin: async (id) => id === key })), key);
});

Deno.test("admin counts shape, moderation identity, and unsupported frontend state cannot override server actor", async () => {
  let seen: unknown;
  const handler = createHandler(repository({
    user: async () => key, isAdmin: async () => true,
    moderate: async (...args) => { seen = args; return true; },
  }), config);
  const headers = { Authorization: "Bearer real" };
  const listing = await (await handler(request({ action: "list-admin", tab: "messages" }, headers))).json();
  equal(listing, { messages: [], hasMore: false, counts: { pending: 1, approved: 2, rejected: 3, unread: 4 }, notificationFailures: 5 });
  const res = await handler(request({ action: "moderate-note", id: key, status: "approved", approved_by: "attacker", approved_at: "2000-01-01" }, headers));
  equal(res.status, 200); equal(seen, [key, "approved", key]);
  equal((await handler(request({ action: "moderate-note", id: key, status: "pending" }, headers))).status, 400);
});

Deno.test("trusted IP must exist, IPv6 is canonical, hashes are domain-separated", async () => {
  await rejects(() => clientIp(request({}, { "x-forwarded-for": "" }), config), 403);
  await rejects(() => clientIp(request({}, { "x-forwarded-for": "forged" }), config), 403);
  equal(clientIp(request({}, { "x-forwarded-for": "attacker, 192.0.2.9" }), config), "192.0.2.9");
  equal(clientIp(request({}, { "x-forwarded-for": "2001:0db8:0:0:0:0:0:1" }), config), "[2001:db8::1]");
  const hash = await keyedHash(config.hashSecret, "ip", "192.0.2.9");
  assert(/^[a-f0-9]{64}$/.test(hash)); assert(hash !== await keyedHash(config.hashSecret, "content", "192.0.2.9"));
});

Deno.test("CAPTCHA requires success, expected action and exact hostname; provider outage fails closed", async () => {
  const value = validateSubmission(input, "note");
  await verifyCaptcha(value, "192.0.2.1", config, captchaFetch);
  const keys: string[] = [];
  const recordingFetch = ((url, options) => {
    keys.push((options?.body as URLSearchParams).get("idempotency_key")!);
    return captchaFetch(url, options);
  }) as typeof fetch;
  await verifyCaptcha(value, "192.0.2.1", config, recordingFetch);
  await verifyCaptcha(value, "192.0.2.1", config, recordingFetch);
  await verifyCaptcha({ ...value, captchaToken: "fresh-widget-token" }, "192.0.2.1", config, recordingFetch);
  equal(keys[0], keys[1]); assert(keys[1] !== keys[2], "refreshed CAPTCHA must not reuse a cached failed verification");
  for (const body of [{ success: false }, { success: true, hostname: "evil.example", action: "portfolio-note" }, { success: true, hostname: "portfolio.example", action: "portfolio-message" }]) {
    await rejects(() => verifyCaptcha(value, "192.0.2.1", config, (async () => new Response(JSON.stringify(body))) as typeof fetch), 403);
  }
  await rejects(() => verifyCaptcha(value, "192.0.2.1", config, (async () => { throw new Error("secret provider failure"); }) as typeof fetch), 503);
});

Deno.test("submissions always consume durable rate before CAPTCHA, including no-Origin callers", async () => {
  let captchaCalls = 0;
  let submitCalls = 0;
  const fetcher = (async () => { captchaCalls++; return new Response("{}"); }) as typeof fetch;
  const handler = createHandler(repository({ consumeRate: async () => false, submit: async () => { submitCalls++; return { outcome: "created" }; } }), config, fetcher);
  equal((await handler(request({ action: "submit-note", ...input }))).status, 429);
  equal([captchaCalls, submitCalls], [0, 0]);
  const missingIp = await handler(request({ action: "submit-note", ...input }, { "x-forwarded-for": "" }));
  equal(missingIp.status, 403);
  const noOrigin = createHandler(repository({ submit: async () => { submitCalls++; return { outcome: "created" }; } }), config, fetcher);
  equal((await noOrigin(request({ action: "submit-note", ...input }))).status, 403);
  equal(submitCalls, 0); equal(captchaCalls, 1);
});

Deno.test("duplicate key replay succeeds; content conflict is 409; outbox/provider failure never loses accepted submission", async () => {
  for (const outcome of ["created", "duplicate", "conflict"]) {
    const handler = createHandler(repository({ submit: async () => ({ outcome, notification_id: key }), claim: async () => { throw new Error("outbox unavailable"); } }), config, captchaFetch);
    const res = await handler(request({ action: "submit-note", ...input }));
    equal(res.status, outcome === "conflict" ? 409 : 200);
    if (outcome !== "conflict") equal(await res.json(), { success: true });
  }
});

const outbox: Outbox = {
  id: key, kind: "note", lease_token: key,
  payload: { id: key, name: "Ada", email: null, subject: null, message: "Hello", created_at: "2026-11-01T12:34:56.000Z", status: "pending" },
};
Deno.test("retry notifications use stable provider idempotency keys, plaintext, and lease-fenced completion", async () => {
  let sent: unknown;
  const fetcher = (async (_url, options) => {
    equal(new Headers(options?.headers).get("idempotency-key"), `portfolio-${key}`);
    const body = JSON.parse(options?.body as string);
    equal(body.subject, "New Portfolio Note — Pending Approval");
    assert(body.text.includes("https://portfolio.example/admin/notes")); assert(!("html" in body));
    assert(!("reply_to" in body), "optional note email absent: no reply-to");
    equal(body.to, [config.ownerEmail]);
    return new Response("provider secret", { status: 503 });
  }) as typeof fetch;
  const handler = createHandler(repository({ user: async () => key, isAdmin: async () => true, claim: async () => [outbox], finish: async (row, success) => { equal(row.lease_token, key); sent = success; return true; } }), config, fetcher);
  const res = await handler(request({ action: "retry-notifications" }, { Authorization: "Bearer real" }));
  equal(await res.json(), { sent: 0, failed: 1 }); equal(sent, false);
  const note = notification(outbox, config);
  equal(note, {
    subject: "New Portfolio Note — Pending Approval",
    text: [
      "A new guestbook note is pending approval. This note is not yet published.",
      "Submitted at: 2026-11-01T12:34:56.000Z", "Initial status: pending",
      "Name: Ada", "Email: Not provided", "", "Hello", "",
      "Manage in the dashboard: https://portfolio.example/admin/notes", `Submission ID: ${key}`,
    ].join("\n"),
  });
  const contact = notification({ ...outbox, kind: "message", payload: { ...outbox.payload, email: "ada@example.com", subject: "Project", status: "unread" } }, config);
  equal(contact, {
    subject: "New Portfolio Contact — Project", reply_to: "ada@example.com",
    text: [
      "A new portfolio contact message has arrived.",
      "Submitted at: 2026-11-01T12:34:56.000Z", "Initial status: unread",
      "Name: Ada", "Email: ada@example.com", "Subject: Project", "", "Hello", "",
      "Manage in the dashboard: https://portfolio.example/admin/notes", `Submission ID: ${key}`,
    ].join("\n"),
  });
});

Deno.test("notification delivery uses validated optional visitor reply-to for notes and contacts", async () => {
  for (const kind of ["note", "message"] as const) {
    const row: Outbox = { ...outbox, kind, payload: { ...outbox.payload, email: "ada@example.com", subject: kind === "message" ? "Project" : null, status: kind === "message" ? "unread" : "pending" } };
    const fetcher = (async (_url, options) => {
      const body = JSON.parse(options?.body as string);
      equal(body, { from: config.resendFrom, to: [config.ownerEmail], ...notification(row, config) });
      equal(body.reply_to, "ada@example.com");
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    equal(await deliverNotifications(repository({ claim: async () => [row] }), config, fetcher), { sent: 1, failed: 0 });
  }
  for (const email of [null, "invalid", " ada@example.com ", "ada\x01@example.com", `${"a".repeat(250)}@example.com`, "ada@example.com\r\nBcc: evil@example.com"]) {
    assert(!("reply_to" in notification({ ...outbox, payload: { ...outbox.payload, email } }, config)));
  }
});

Deno.test("unexpected backend errors cannot leak tokens, emails, SQL or provider response details", async () => {
  const handler = createHandler(repository({ publicNotes: async () => { throw new Error("SQL secret@example.com service-role-key"); } }), config);
  const res = await handler(request({ action: "list-notes" }));
  equal(res.status, 500); equal(await res.json(), { error: "Something went wrong. Please try again later." });
});

Deno.test("configuration rejects wildcard origins and production CAPTCHA bypass", async () => {
  const env: Record<string, string> = {
    ALLOWED_ORIGINS: "https://portfolio.example,http://localhost:5173", SITE_URL: "https://portfolio.example",
    TURNSTILE_HOSTNAMES: "portfolio.example", TURNSTILE_SECRET_KEY: "secret", IP_HASH_SECRET: config.hashSecret,
    TRUSTED_IP_HEADER: "x-forwarded-for", TRUSTED_IP_INDEX: "-1", RESEND_API_KEY: "secret", RESEND_FROM_EMAIL: "hello@example.com",
  };
  equal(loadConfig((name) => env[name]).ownerEmail, "chandrakarankit014@gmail.com");
  await rejects(() => loadConfig((name) => ({ ...env, ALLOWED_ORIGINS: "*" })[name]));
  await rejects(() => loadConfig((name) => ({ ...env, LOCAL_CAPTCHA_BYPASS: "true", APP_ENV: "local" })[name]));
  const local: Record<string, string> = { ...env, SUPABASE_URL: "http://kong:8000", LOCAL_CAPTCHA_BYPASS: "true", APP_ENV: "local", SITE_URL: "http://localhost:5173", ALLOWED_ORIGINS: "http://localhost:5173" };
  assert(loadConfig((name) => local[name]).localBypass);
  await rejects(() => loadConfig((name) => ({ ...local, SUPABASE_URL: "https://hosted-project.supabase.co" })[name]));
  await rejects(() => loadConfig((name) => ({ ...local, DENO_DEPLOYMENT_ID: "hosted-deployment" })[name]));
});
