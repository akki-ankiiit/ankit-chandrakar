# Portfolio backend

One Edge Function, `portfolio-api`, implements the agreed JSON POST action contract. Its `verify_jwt = false` setting is intentional: public actions need no session, while **every admin action** calls Supabase Auth `getUser(token)` and checks the returned UUID against `portfolio_private.portfolio_admins`. Browser email comparisons have no authority. Only backend files and backend tests are needed; there are no application package dependencies.

## Provisioning

1. Apply `migrations/202611010001_portfolio.sql` to your Supabase project through your normal migration workflow. Do not expose the `portfolio_private` schema through the Data API.
2. In Supabase Auth, manually create a confirmed password-login user for `chandrakarankit014@gmail.com`. Use a unique strong password. Disable public signups in Auth settings if this project does not otherwise need them. There is no signup trigger, email-based authorization rule, or automatic signup grant.
3. Explicitly run `bootstrap-owner.sql` as the database owner. It selects the **confirmed** Auth UUID for the expected email, fails if missing/ambiguous, and inserts only that UUID into the private allowlist. Removing that allowlist row revokes admin API access on the next request. To delete an Auth owner who has approved notes, first reassign or unpublish their approvals (the attribution FK intentionally preserves accountability).
4. Configure server secrets from `secrets.example`. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted functions. Never put service-role, Resend, Turnstile secret, or hash-secret values in `VITE_*`, frontend code, or committed files. The example uses placeholders; replace them all.
5. Set exact `ALLOWED_ORIGINS` including the required localhost URLs and actual production origin(s); no wildcard, paths, trailing slash, or `null` origins. Set `SITE_URL` to the canonical origin (notification dashboard link is `${SITE_URL}/admin/notes`). Create a Turnstile widget for the actual domains and configure exact `TURNSTILE_HOSTNAMES`. Client widget actions must be `portfolio-note` and `portfolio-message`; the server verifies these in addition to token success and hostname.
6. Configure a verified Resend sending domain/address in `RESEND_FROM_EMAIL` and its `RESEND_API_KEY`. `OWNER_EMAIL` defaults to `chandrakarankit014@gmail.com` (server configuration can override the notification recipient; it does **not** change admin authority).
7. Verify the trusted ingress IP boundary as described below, then publish `portfolio-api` using `supabase/config.toml`. No hosted deployment has been executed by this implementation.

For local serving, copy the placeholder example to an ignored environment file and supply it to the Supabase local function server. Real Turnstile testing works with an appropriately configured local/test widget. A local-only bypass requires **both** `LOCAL_CAPTCHA_BYPASS=true` and `APP_ENV=local`, and all configured origins and `SITE_URL` must be localhost/loopback. `SUPABASE_URL` must also point to a local HTTP backend (loopback, `kong`, or `host.docker.internal`), and hosted `DENO_DEPLOYMENT_ID` must be absent. With bypass enabled, the `captchaToken` field is still required and nonempty. The function refuses to start if a bypass is combined with a production URL/origin or hosted backend/deployment. Leave it `false` in production.

### Trusted IP boundary (required deployment configuration)

The Edge runtime cannot infer whether an arbitrary HTTP forwarding header is trustworthy. `TRUSTED_IP_HEADER` and `TRUSTED_IP_INDEX` must identify an address **overwritten or appended by your trusted platform gateway**, not an address supplied by the caller. The example selects the rightmost `x-forwarded-for` entry (`-1`) and is only valid if your deployment gateway appends the actual peer address there. Verify the behavior for your specific Supabase gateway/custom proxy by testing requests with forged forwarding headers. If the gateway overwrites a single trusted header instead, configure that header and index `0`. `x-forwarded-for`, `cf-connecting-ip`, and `x-real-ip` are the supported header names. Never select a caller-controlled list entry or enable a proxy route that bypasses the trusted gateway. Missing/invalid selected IPs are blocked, including local requests; local testing needs the selected header injected by the local trusted server/proxy.

Raw IPs are never stored. The server uses domain-separated HMAC-SHA256 with `IP_HASH_SECRET` (use at least 32 random bytes), and passes the IP only to Turnstile for verification. Rotate the secret deliberately: rotation resets rate/content identities for existing windows. Database rate consumption is an atomic upsert, allowing **10 validated submission attempts per IP per 10-minute window**, shared across notes and messages, before CAPTCHA/provider work. No-Origin server requests are allowed but still require IP verification, rate consumption, and CAPTCHA.

## HTTP contract

Send `Content-Type: application/json`, method `POST`, and `{ "action": "...", ... }` to `/functions/v1/portfolio-api`. `OPTIONS` supports configured origins. Requests are byte-limited to 32 KiB and compressed bodies are rejected. Responses contain JSON, disable caching, and never expose database/provider exception text.

| Action | Input / output |
| --- | --- |
| `list-notes` | `{offset?:0,limit?:12}` → `{notes:[{id,name,message,approved_at}],hasMore}`; approved only, `approved_at DESC,id DESC` |
| `submit-note` | `{name,email?,message,botcheck:'',captchaToken,idempotencyKey:UUID}` → `{success:true}`; always saved as pending |
| `submit-message` | `{name,email,subject,message,botcheck:'',captchaToken,idempotencyKey:UUID}` → `{success:true}` |
| `list-admin` | Bearer JWT; `{tab:'pending'|'approved'|'rejected'|'messages',offset?:0,limit?:20}` → `{notes:[] OR messages:[],hasMore,counts:{pending,approved,rejected,unread},notificationFailures}` |
| `moderate-note` | Bearer JWT; `{id,status:'approved'|'rejected'}` → `{success:true}` |
| `delete-note` | Bearer JWT; `{id}` → `{success:true}` |
| `update-message` | Bearer JWT; `{id,status:'unread'|'read'|'archived'}` → `{success:true}` |
| `retry-notifications` | Bearer JWT → `{sent,failed}` for at most 10 due notifications claimed by this invocation |

Admin note rows include `id,name,email,message,created_at,status,approved_at`; message rows include `id,name,email,subject,message,created_at,status`. Admin pages order by `created_at DESC,id DESC`. Limits are integers 1–100; offsets are integers 0–100000. `hasMore` uses one lookahead row, not an unbounded fetch. No fields are added to the agreed public response shapes.

Name max 100, email max 254, note max 500, subject max 150, contact max 5000 **Unicode code points** after trimming. Email is lowercased; a blank optional note email becomes SQL NULL. Names/subjects/emails disallow control characters; messages allow line breaks/tabs. HTML is never used in notification templates. Render user content as text in the browser. `botcheck` must be present and exactly empty. CAPTCHA is mandatory even for matching idempotent replays; a deterministic verification UUID is derived from the submission UUID **and CAPTCHA token**, so retrying a provider request is idempotent while refreshing the widget does not reuse a cached failed verification. Reset the browser widget after failed verification as needed.

Public errors always have `{error:'safe human message'}` and meaningful statuses: 400 invalid input, 401 missing/invalid session, 403 origin/CAPTCHA/authorization/IP denial, 404 missing admin target, 409 duplicate content/key conflict, 413 oversized body, 415 invalid content type/encoding, 429 rate limit, 500 unexpected failure, 503 CAPTCHA/configuration unavailable. Successful exact-key/content retries return `{success:true}`. Fresh keys with identical normalized content are rejected with 409 for ten minutes; conflicting key reuse is rejected for 24 hours. Keep the same UUID and payload when retrying an uncertain accepted request. Do not silently generate a new key on every retry.

## Database/security design

- Base `portfolio_notes` rows include private email and approval attribution. There is **no** public table/view grant, even for approved rows. The service backend explicitly selects public columns and applies a second output whitelist. `portfolio_messages` is entirely private.
- All seven application/helper tables enable RLS. `anon` and `authenticated` have no base-table or helper privileges and no execution privilege on privileged RPCs. There are deliberately no client RLS policies. `service_role` is the only application data path; it is held only by the Edge Function. All privileged functions pin `search_path = pg_catalog` and fully qualify application objects.
- Database constraints independently enforce trimmed lengths, email structure, allowed statuses, and consistent publication metadata. Names, messages, and subjects must include a character outside JavaScript's Unicode whitespace set, so whitespace-only tabs/newlines/NBSP/BOM cannot bypass checks through service SQL. Names, emails, and subjects reject ASCII controls; messages allow TAB/CR/LF but reject other ASCII controls (PostgreSQL text also rejects NUL). Submissions cannot specify status/approval fields. Moderation rechecks the admin UUID in SQL and supplies server timestamps/actor, clearing publication metadata on rejection. Reapproving an already approved note preserves its approval timestamp/order.
- `portfolio_submit` commits the note/message, 24-hour idempotency record, 10-minute content fingerprint, and outbox entry in **one transaction**. Key serialization and conditional unique content upserts handle simultaneous requests, including different keys for identical content. Content fingerprints are also keyed, and contain no raw submitted content.
- Contact messages have both chronological and `(status, created_at DESC, id DESC)` indexes, supporting the full inbox and status-specific access/counts.

## Notifications and retention

Submissions are committed before any email is attempted. The same transaction captures each source row's actual `created_at` and initial `status` using `INSERT ... RETURNING` in the outbox snapshot. Later moderation/read-status changes do not alter that snapshot. Plaintext emails include the submitted timestamp and initial `pending`/`unread` status. Note emails explicitly state that the note is not yet published. Subjects are exactly `New Portfolio Note — Pending Approval` and `New Portfolio Contact — ${subject}`. The dashboard link is `${SITE_URL}/admin/notes`. When the visitor provides a valid email, the provider receives it as `reply_to`; absent/invalid stored email produces no reply-to header.

A Resend failure/timeout/Edge interruption cannot undo accepted data; the admin dashboard **manual retry** action claims due outbox rows. No mandatory scheduler or paid service is needed. Retry from the dashboard after the backoff interval. The returned counters describe this invocation, while `notificationFailures` counts failed/expired rows, abandoned processing leases, and **unclaimed pending notifications older than 90 seconds**, so an Edge interruption before the first claim remains visible. Fresh pending notifications and active processing leases are not failures. Rows in backoff are not immediately reattempted, so a retry may correctly return `{sent:0,failed:0}`.

Workers claim with `FOR UPDATE SKIP LOCKED`, a 90-second lease, and a unique fencing token; provider requests time out after 8 seconds and use stable `Idempotency-Key: portfolio-<outbox UUID>`. Attempts are capped at eight, with exponential backoff from 60 seconds to one hour. A recovered worker cannot finish a replaced lease. To avoid duplicate email after Resend's 24-hour idempotency retention expires, retry stops 23 hours after the **first attempt**, including ambiguous timeout results. These terminal `expired` rows remain visible in `notificationFailures`; the manual retry action does not resend them. An unattempted pending notification has no provider idempotency clock yet and can be claimed manually while retained. All snapshots, whether unattempted, sent, failed, or expired, are eligible for cleanup after 30 days from outbox creation; email expiry/cleanup never deletes the submitted note or message. Configuration changes to sender, recipient, or site URL during a retry window can cause Resend payload/idempotency conflicts; keep them stable during that window.

Helper cleanup is opportunistic on submission attempts, at most 100 expired rows per table per call. Rate rows expire after 10 minutes; fingerprints after 10 minutes; request IDs after 24 hours; **all** outbox payloads (including failures and delivered mail) after 30 days. This prevents steady-traffic helper growth and avoids unbounded PII/error-history retention. For idle deployments or unusually large backlogs, manually run repeated `select public.portfolio_cleanup();` calls as the database owner/service context, or optionally schedule them (e.g. with free pg_cron). No scheduler/cron extension is required or enabled by the migration. The function is bounded, so repeat until a large backlog is cleared. Notes and contact messages themselves persist for owner moderation/archive/delete workflows; helper retention does not delete submitted data. Deleting a note does not recall an email or cancel its already-created notification payload, which expires on the same retention schedule.

## Local verification

From the project root, with Deno 2 installed:

```sh
deno test --config supabase/deno.json --allow-read tests/backend
deno check --config supabase/deno.json supabase/functions/portfolio-api/index.ts
deno lint --config supabase/deno.json supabase/functions/portfolio-api tests/backend
```

On this workspace, Deno is not on the shell PATH. The native Deno binary used for verification is `/Users/akki/.npm/_npx/05b6ef7b13673c57/node_modules/@deno/darwin-arm64/deno` (Deno 2.9.6). The exact native invocations, also from the project root, are:

```sh
"/Users/akki/.npm/_npx/05b6ef7b13673c57/node_modules/@deno/darwin-arm64/deno" test --config supabase/deno.json --allow-read tests/backend
"/Users/akki/.npm/_npx/05b6ef7b13673c57/node_modules/@deno/darwin-arm64/deno" check --config supabase/deno.json supabase/functions/portfolio-api/index.ts
"/Users/akki/.npm/_npx/05b6ef7b13673c57/node_modules/@deno/darwin-arm64/deno" lint --config supabase/deno.json supabase/functions/portfolio-api tests/backend
```

That npm-cache path is machine-specific; use your installed Deno executable on other machines.

The Deno tests use injected Auth/database/provider boundaries plus PGlite (a real in-memory PostgreSQL WASM engine) for migration, privilege denials, atomic dedup rollback, publication metadata, durable rate windows, leases, backoff, retention, and confirmed-owner bootstrap. No hosted project, actual email, or live Turnstile/Auth endpoint is involved.

For the additional **pgTAP** suite, start a local Supabase stack with Docker, apply the migration locally, then run `supabase test db supabase/tests/portfolio_security.test.sql`. It runs in a rolled-back transaction and tests real client roles and RPC grants. A full local Supabase stack is needed to validate the platform's Auth schema, PostgREST exposure/grants and Edge gateway behavior; PGlite is not a replacement for that final integration check.
