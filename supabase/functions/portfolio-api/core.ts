import { isIP } from "node:net";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export type Submission = {
  kind: "note" | "message";
  name: string;
  email: string | null;
  message: string;
  subject: string | null;
  captchaToken: string;
  idempotencyKey: string;
};
export type PublicNote = { id: string; name: string; message: string; approved_at: string };
export type Outbox = {
  id: string;
  kind: "note" | "message";
  lease_token: string;
  payload: {
    id: string; name: string; email: string | null; subject: string | null; message: string;
    created_at: string; status: "pending" | "unread";
  };
};
export interface Repository {
  publicNotes(offset: number, limit: number): Promise<PublicNote[]>;
  user(token: string): Promise<string | null>;
  isAdmin(id: string): Promise<boolean>;
  consumeRate(hash: string): Promise<boolean>;
  submit(value: Submission, hash: string): Promise<{ outcome: string; notification_id?: string }>;
  adminRows(tab: string, offset: number, limit: number): Promise<Record<string, unknown>[]>;
  counts(): Promise<{ pending: number; approved: number; rejected: number; unread: number; notificationFailures: number }>;
  moderate(id: string, status: string, admin: string): Promise<boolean>;
  deleteNote(id: string): Promise<boolean>;
  updateMessage(id: string, status: string): Promise<boolean>;
  claim(id?: string): Promise<Outbox[]>;
  finish(row: Outbox, sent: boolean): Promise<boolean>;
}
export type Config = {
  origins: Set<string>;
  captchaHosts: Set<string>;
  turnstileSecret: string;
  hashSecret: string;
  ipHeader: string;
  ipIndex: number;
  localBypass: boolean;
  resendKey: string;
  resendFrom: string;
  ownerEmail: string;
  siteUrl: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const localHost = (host: string) => ["localhost", "127.0.0.1", "[::1]"].includes(host);
export function loadConfig(env: (name: string) => string | undefined): Config {
  const required = (name: string) => {
    const value = env(name)?.trim();
    if (!value) throw new Error(`Missing server configuration: ${name}`);
    return value;
  };
  const origins = new Set(required("ALLOWED_ORIGINS").split(",").map((s) => s.trim()));
  for (const origin of origins) {
    const url = new URL(origin);
    if (url.origin !== origin || url.username || url.password || !(url.protocol === "https:" || (url.protocol === "http:" && localHost(url.hostname)))) {
      throw new Error("ALLOWED_ORIGINS must contain exact HTTPS origins or localhost HTTP origins");
    }
  }
  const siteUrl = required("SITE_URL").replace(/\/$/, "");
  const site = new URL(siteUrl);
  if (site.origin !== siteUrl || !(site.protocol === "https:" || (site.protocol === "http:" && localHost(site.hostname)))) throw new Error("Invalid SITE_URL");
  const localBypass = env("LOCAL_CAPTCHA_BYPASS") === "true";
  // Both gates required; refuse to start with a local bypass on a production URL/origin.
  if (localBypass && (env("APP_ENV") !== "local" || !localHost(site.hostname) || [...origins].some((o) => !localHost(new URL(o).hostname)))) {
    throw new Error("CAPTCHA bypass is restricted to an explicitly local configuration");
  }
  if (localBypass) {
    const backend = new URL(required("SUPABASE_URL"));
    if (env("DENO_DEPLOYMENT_ID") || backend.protocol !== "http:" || !(localHost(backend.hostname) || ["kong", "host.docker.internal"].includes(backend.hostname))) {
      throw new Error("CAPTCHA bypass cannot run against a hosted Supabase backend");
    }
  }
  const captchaHosts = new Set(required("TURNSTILE_HOSTNAMES").split(",").map((s) => s.trim().toLowerCase()));
  if ([...captchaHosts].some((host) => !host || host.includes("/") || host.includes("*") || host.includes(":"))) throw new Error("Invalid Turnstile hostnames");
  const hashSecret = required("IP_HASH_SECRET");
  if (hashSecret.length < 32) throw new Error("IP_HASH_SECRET must have at least 32 characters");
  const ipHeader = required("TRUSTED_IP_HEADER").toLowerCase();
  if (!["x-forwarded-for", "cf-connecting-ip", "x-real-ip"].includes(ipHeader)) throw new Error("Invalid trusted IP header");
  const index = required("TRUSTED_IP_INDEX");
  if (!/^-?\d+$/.test(index)) throw new Error("Invalid trusted IP index");
  const ipIndex = Number(index);
  if (!Number.isSafeInteger(ipIndex) || Math.abs(ipIndex) > 10) throw new Error("Invalid trusted IP index");
  const resendFrom = required("RESEND_FROM_EMAIL");
  const ownerEmail = env("OWNER_EMAIL")?.trim() || "chandrakarankit014@gmail.com";
  if (!EMAIL.test(ownerEmail) || /[\r\n]/.test(resendFrom)) throw new Error("Invalid mail configuration");
  return {
    origins, captchaHosts, localBypass, hashSecret, ipHeader, ipIndex, siteUrl,
    turnstileSecret: localBypass ? (env("TURNSTILE_SECRET_KEY") || "") : required("TURNSTILE_SECRET_KEY"),
    resendKey: required("RESEND_API_KEY"), resendFrom, ownerEmail,
  };
}

function text(body: Record<string, unknown>, key: string, max: number, optional = false, multiline = false): string {
  const input = body[key];
  if (optional && (input === undefined || input === null || input === "")) return "";
  if (typeof input !== "string") throw new ApiError(400, `Please enter a valid ${key}.`);
  const value = input.trim();
  // Intentional rejection of NUL/ASCII controls; only message whitespace is allowed.
  // deno-lint-ignore no-control-regex
  if ((!optional && !value) || [...value].length > max || (multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/).test(value)) {
    throw new ApiError(400, `Please enter a valid ${key} (maximum ${max} characters).`);
  }
  return value;
}
export function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) throw new ApiError(400, "Please provide a valid request ID.");
  return value.toLowerCase();
}
export function validateSubmission(body: Record<string, unknown>, kind: "note" | "message"): Submission {
  if (body.botcheck !== "") throw new ApiError(400, "Unable to accept this submission.");
  const email = text(body, "email", 254, kind === "note").toLowerCase();
  if (email && !EMAIL.test(email)) throw new ApiError(400, "Please enter a valid email address.");
  return {
    kind, name: text(body, "name", 100), email: email || null,
    message: text(body, "message", kind === "note" ? 500 : 5000, false, true),
    subject: kind === "message" ? text(body, "subject", 150) : null,
    // Notes are moderated (always pending) and rate-limited; only private messages require CAPTCHA.
    captchaToken: text(body, "captchaToken", 2048, kind === "note"), idempotencyKey: uuid(body.idempotencyKey),
  };
}
export function pagination(body: Record<string, unknown>, defaultLimit: number): { offset: number; limit: number } {
  const offset = body.offset ?? 0;
  const limit = body.limit ?? defaultLimit;
  if (!Number.isSafeInteger(offset) || (offset as number) < 0 || (offset as number) > 100000 || !Number.isSafeInteger(limit) || (limit as number) < 1 || (limit as number) > 100) {
    throw new ApiError(400, "Please provide a valid page (limit 1–100, offset 0–100000).");
  }
  return { offset: offset as number, limit: limit as number };
}
// Defense in depth: never spread a DB row into a public response.
export function publicProjection(row: PublicNote): PublicNote {
  return { id: row.id, name: row.name, message: row.message, approved_at: row.approved_at };
}
export function clientIp(request: Request, config: Config): string {
  const values = request.headers.get(config.ipHeader)?.split(",").map((s) => s.trim()) || [];
  const ip = values.at(config.ipIndex);
  if (!ip || !isIP(ip)) throw new ApiError(403, "Unable to verify this request. Please try again later.");
  // Canonicalize IPv6 spellings to prevent rate-limit evasion.
  return isIP(ip) === 6 ? new URL(`http://[${ip}]/`).hostname : ip;
}
export async function keyedHash(secret: string, domain: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${domain}\n${value}`)));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function authorize(request: Request, repo: Repository): Promise<string> {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization") || "");
  if (!match) throw new ApiError(401, "Please sign in to continue.");
  const id = await repo.user(match[1]); // auth.getUser: remote validation on EVERY admin request.
  if (!id) throw new ApiError(401, "Your session has expired. Please sign in again.");
  if (!await repo.isAdmin(id)) throw new ApiError(403, "You do not have access to this action.");
  return id;
}

export async function verifyCaptcha(value: Submission, ip: string, config: Config, fetcher: typeof fetch): Promise<void> {
  if (config.localBypass) return;
  let result: Record<string, unknown>;
  try {
    // Reusing the same token after a network failure reuses the verification
    // UUID. Refreshing the widget must NOT reuse a cached failed verification.
    const hash = await keyedHash(config.hashSecret, "captcha", JSON.stringify([value.idempotencyKey, value.captchaToken]));
    const verificationKey = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", signal: AbortSignal.timeout(6000),
      body: new URLSearchParams({ secret: config.turnstileSecret, response: value.captchaToken, remoteip: ip.replace(/^\[|\]$/g, ""), idempotency_key: verificationKey }),
    });
    if (!response.ok) throw new Error("provider unavailable");
    result = await response.json();
  } catch { throw new ApiError(503, "Verification is temporarily unavailable. Please try again."); }
  if (result.success !== true || typeof result.hostname !== "string" || !config.captchaHosts.has(result.hostname.toLowerCase()) || result.action !== `portfolio-${value.kind}`) {
    throw new ApiError(403, "Verification failed. Please complete the security check again.");
  }
}

export function notification(row: Outbox, config: Config): { subject: string; text: string; reply_to?: string } {
  const p = row.payload;
  // Revalidate optional stored email before using it as a provider header.
  // deno-lint-ignore no-control-regex
  const replyTo = p.email && p.email === p.email.trim() && [...p.email].length <= 254 && EMAIL.test(p.email) && !/[\x00-\x1f\x7f]/.test(p.email) ? p.email : null;
  return {
    subject: row.kind === "note" ? "New Portfolio Note — Pending Approval" : `New Portfolio Contact — ${p.subject}`,
    ...(replyTo ? { reply_to: replyTo } : {}),
    text: [
      row.kind === "note" ? "A new guestbook note is pending approval. This note is not yet published." : "A new portfolio contact message has arrived.",
      `Submitted at: ${p.created_at}`, `Initial status: ${p.status}`,
      `Name: ${p.name}`, `Email: ${p.email || "Not provided"}`,
      ...(row.kind === "message" ? [`Subject: ${p.subject}`] : []),
      "", p.message, "", `Manage in the dashboard: ${config.siteUrl}/admin/notes`, `Submission ID: ${p.id}`,
    ].join("\n"),
  };
}
export async function deliverNotifications(repo: Repository, config: Config, fetcher: typeof fetch, id?: string): Promise<{ sent: number; failed: number }> {
  const rows = await repo.claim(id);
  // Concurrent, bounded by the SQL claim limit; all requests fit inside a lease.
  const results = await Promise.all(rows.map(async (row) => {
    let sent = false;
    try {
      const mail = notification(row, config);
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST", signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Bearer ${config.resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `portfolio-${row.id}` },
        body: JSON.stringify({ from: config.resendFrom, to: [config.ownerEmail], ...mail }),
      });
      sent = response.ok;
      await response.body?.cancel(); // Provider bodies/error text are never returned or persisted.
    } catch { /* Ambiguous sends retry with the same provider key within 23h only. */ }
    const finished = await repo.finish(row, sent);
    return sent && finished;
  }));
  return { sent: results.filter(Boolean).length, failed: results.filter((v) => !v).length };
}

const MAX_BODY = 32768;
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new ApiError(415, "Please send a JSON request.");
  const encoding = request.headers.get("content-encoding");
  if (encoding && encoding !== "identity") throw new ApiError(415, "Compressed requests are not supported.");
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY)) throw new ApiError(413, "Your request is too large.");
  if (!request.body) throw new ApiError(400, "Please send a JSON request.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw new ApiError(413, "Your request is too large."); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    return parsed;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Please send a valid JSON object.");
  } finally { reader.releaseLock(); }
}

export function createHandler(repo: Repository, config: Config, fetcher: typeof fetch = fetch) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin", "X-Content-Type-Options": "nosniff" });
    const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers });
    if (origin !== null && !config.origins.has(origin)) return json({ error: "This origin is not allowed." }, 403);
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info, x-supabase-api-version");
    headers.set("Access-Control-Max-Age", "600");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") { headers.set("Allow", "POST, OPTIONS"); return json({ error: "Please use POST for this endpoint." }, 405); }
    try {
      const body = await readBody(request);
      const action = body.action;
      if (action === "list-notes") {
        const { offset, limit } = pagination(body, 12);
        const rows = await repo.publicNotes(offset, limit + 1);
        return json({ notes: rows.slice(0, limit).map(publicProjection), hasMore: rows.length > limit });
      }
      if (action === "submit-note" || action === "submit-message") {
        const value = validateSubmission(body, action === "submit-note" ? "note" : "message");
        const ip = clientIp(request, config);
        const ipHash = await keyedHash(config.hashSecret, "ip", ip);
        if (!await repo.consumeRate(ipHash)) throw new ApiError(429, "Too many submissions. Please try again in ten minutes.");
        if (value.kind === "message") await verifyCaptcha(value, ip, config, fetcher);
        const hash = await keyedHash(config.hashSecret, "content", JSON.stringify([value.kind, value.name, value.email, value.subject, value.message]));
        const result = await repo.submit(value, hash);
        if (result.outcome === "conflict") throw new ApiError(409, "This submission was already received, or its request ID was reused. Please wait before trying again.");
        if (!["created", "duplicate"].includes(result.outcome)) throw new Error("Unexpected submission result");
        if (result.notification_id) {
          // The submission/outbox transaction is already committed. Notification
          // failures must NEVER turn an accepted submission into an API error.
          try { await deliverNotifications(repo, config, fetcher, result.notification_id); } catch { /* durable outbox */ }
        }
        return json({ success: true });
      }
      const adminActions = ["list-admin", "moderate-note", "delete-note", "update-message", "retry-notifications"];
      if (typeof action !== "string" || !adminActions.includes(action)) throw new ApiError(400, "Please provide a supported action.");
      const admin = await authorize(request, repo);
      if (action === "list-admin") {
        if (!["pending", "approved", "rejected", "messages"].includes(body.tab as string)) throw new ApiError(400, "Please select a valid dashboard tab.");
        const { offset, limit } = pagination(body, 20);
        const [rows, allCounts] = await Promise.all([repo.adminRows(body.tab as string, offset, limit + 1), repo.counts()]);
        const { notificationFailures, ...counts } = allCounts;
        return json({ [body.tab === "messages" ? "messages" : "notes"]: rows.slice(0, limit), hasMore: rows.length > limit, counts, notificationFailures });
      }
      if (action === "retry-notifications") return json(await deliverNotifications(repo, config, fetcher));
      const id = uuid(body.id);
      let updated = false;
      if (action === "moderate-note") {
        if (body.status !== "approved" && body.status !== "rejected") throw new ApiError(400, "Please select a valid note status.");
        updated = await repo.moderate(id, body.status, admin);
      } else if (action === "delete-note") updated = await repo.deleteNote(id);
      else if (action === "update-message") {
        if (!["unread", "read", "archived"].includes(body.status as string)) throw new ApiError(400, "Please select a valid message status.");
        updated = await repo.updateMessage(id, body.status as string);
      }
      if (!updated) throw new ApiError(404, "This item could not be found.");
      return json({ success: true });
    } catch (error) {
      if (error instanceof ApiError) return json({ error: error.message }, error.status);
      return json({ error: "Something went wrong. Please try again later." }, 500);
    }
  };
}
