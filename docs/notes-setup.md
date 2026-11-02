# Notes, private messages, and owner dashboard

> **Temporarily paused:** Notes navigation and the `/notes` and `/admin/notes` routes are disabled. The footer currently opens a `mailto:` draft in the visitor's configured email app instead of submitting to the backend. The feature files and backend are retained for restoration; the Notes browser suite is skipped until the routes return. The guide below describes the paused implementation.

Practical operator guide for the implementation in this repository. Commands run from the repository root unless stated otherwise. This guide documents setup and verification steps; it does not certify a deployment, configured credentials, passing checks, or live email delivery.

## 1. Architecture and behavior

```text
React/Vite browser
  /notes              approved wall + note submission
  footer              private contact-message submission
  /admin/notes        Supabase Auth password login + moderation/inbox
          |
          | JSON POST /functions/v1/portfolio-api
          v
Supabase Edge Function (server-only service-role client)
  public listing: explicit approved-only field projection
  submissions: validation -> trusted IP -> rate window -> Turnstile
               -> atomic note/message + dedup/idempotency + outbox transaction
  admin actions: Auth getUser(JWT) -> private UUID allowlist on every request
          |                              |
          v                              v
PostgreSQL, seven RLS tables        Resend transactional email API
                                   -> owner inbox
```

- Notes start **pending**. Only owner approval publishes them; rejection unpublishes them and clears approval metadata. Reapproving an already approved row preserves its publication timestamp. Public ordering is `approved_at DESC, id DESC`.
- Optional note email is private, including after approval. Public JSON contains exactly `id`, `name`, `message`, and `approved_at`. Contact messages are entirely private and start **unread**.
- The owner can approve/reject/delete notes and mark messages read/unread/archived. Archive retains the message in the inbox; there is no message-delete action in this UI/API. Notes/messages persist independently of helper cleanup.
- Public pages load 12 notes per page; dashboard lists load 20 items. The dashboard polls counts every 45 seconds while visible and offers refresh; this uses HTTP, not Realtime subscriptions.
- Submission success means database acceptance, **not inbox delivery**. Notification errors do not roll back pending notes or contact messages.
- Footer submission stays in the website, with no mailto/Web3Forms fallback. Missing public configuration disables submission and displays an explicit notice.

### Feature file map

These are the notes/contact feature files and integration points, including supporting configuration; unrelated portfolio changes are outside this map.

| File(s) | Responsibility |
| --- | --- |
| `src/App.jsx` | Lazy `/notes` and `/admin/notes` routes, navigation/title handling, shared footer. |
| `src/components/Header.jsx` | Desktop/mobile Notes navigation and current-page state. |
| `src/components/Contact.jsx` | Shared private-message footer, displayed contact email, link to notes. |
| `src/components/ui.jsx` (reused) | Existing shared form/action buttons and footer reveal component; not changed for this feature. |
| `src/components/SubmissionForm.jsx` | Shared note/message form, Unicode length validation, honeypot, CAPTCHA, request locking, stable UUID per unchanged retry payload, success/error states. |
| `src/components/Turnstile.jsx` | Explicit widget loading, separate actions, expiry/error handling, retry/reset and cleanup. |
| `src/lib/supabase.js` | Public configuration validation and Supabase Auth client. |
| `src/lib/portfolio-api.js` | JSON fetch client, public key/JWT headers, 20-second timeout, safe client error mapping, dates. |
| `src/pages/Notes.jsx` | Editorial intro, submission, approved wall, refresh/pagination and loading/empty/error states. |
| `src/pages/AdminNotes.jsx` | Password login/session handling, private data clearing, moderation, inbox, counts, notification retry, client `noindex`. |
| `src/styles/notes.css` | Forms, wall/dashboard layouts, focus/error states and responsive styling. |
| `.env.example` | Three public browser variable placeholders. |
| `.gitignore` | Ignore local env files, Supabase transient state, deployment/test artifacts; keep public example. |
| `package.json`, `package-lock.json` | Frontend Supabase SDK dependency and reproducible npm dependency tree. |
| `supabase/config.toml` | Project identifier, no seeds, function gateway JWT verification disabled intentionally. |
| `supabase/migrations/202611010001_portfolio.sql` | Seven tables, constraints/indexes, grants/RLS, eight privileged SQL functions. |
| `supabase/bootstrap-owner.sql` | Explicit confirmed-owner UUID bootstrap. |
| `supabase/functions/portfolio-api/index.ts` | Edge entry point; configuration failure returns safe 503. |
| `supabase/functions/portfolio-api/core.ts` | HTTP/action contracts, validation, origin/IP/CAPTCHA/auth checks, HMAC identities, plaintext notifications and delivery. |
| `supabase/functions/portfolio-api/repository.ts` | Service-role queries, Auth validation, RPC adapter; independently pinned server SDK. |
| `supabase/secrets.example` | Server-only configuration placeholders. |
| `supabase/deno.json`, `supabase/deno.lock` | Deno configuration and backend dependency pins. |
| `supabase/README.md` | Backend contract/security/retention details and backend verification notes. |
| `tests/backend/portfolio-api_test.ts` | Handler/provider/Auth boundary tests. |
| `tests/backend/database_test.ts` | PGlite migration, constraints, privileges, bootstrap and transactional/outbox tests. |
| `supabase/tests/portfolio_security.test.sql` | Full local Supabase pgTAP security/integration suite. |
| `tests/e2e/notes.spec.js`, `playwright.config.js` | Mocked browser scenarios across five viewports, dedicated strict-port Vite server and `PLAYWRIGHT_PORT` override. |
| `vercel.json`, `public/_redirects` | SPA direct-entry rewrites for Vercel and Netlify/Cloudflare Pages. |
| `README.md`, `docs/notes-setup.md` | Entry-point documentation and this runbook. |

## 2. Database and authorization

Apply `supabase/migrations/202611010001_portfolio.sql` before bootstrapping or serving requests.

| Table | Columns and purpose |
| --- | --- |
| `public.portfolio_notes` | UUID `id`; `name`, nullable private `email`, `message`; `status` (`pending`, `approved`, `rejected`); `created_at`, nullable `approved_at`, `approved_by` referencing `auth.users`. Approved rows require both approval fields; other statuses require both NULL. |
| `public.portfolio_messages` | UUID `id`; `name`, required `email`, `subject`, `message`; `status` (`unread`, `read`, `archived`); `created_at`. Chronological and status/chronological indexes. |
| `portfolio_private.portfolio_admins` | `user_id` UUID primary key/FK to Auth (cascade on Auth deletion), `created_at`. Only explicit UUID membership grants API administration. |
| `portfolio_private.rate_limits` | `ip_hash` HMAC primary key, `window_start`, `hits`, `expires_at`. Atomic 10-attempt/10-minute window shared across notes/messages. |
| `portfolio_private.submissions` | UUID `idempotency_key`, `kind`, `content_hash`, `expires_at`. Same-key/same-content retry succeeds; changed content conflicts for 24 hours. |
| `portfolio_private.content_dedup` | `content_hash` HMAC primary key, `expires_at`. Identical normalized content with a new key conflicts for 10 minutes. |
| `portfolio_private.notification_outbox` | UUID `id`, `kind`, private JSON `payload`; `status` (`pending`, `processing`, `failed`, `sent`, `expired`); `attempts`, `created_at`, `first_attempt_at`, `next_attempt_at`, `lease_until`, `lease_token`, `sent_at`. Durable immutable submission snapshot and bounded delivery state. |

All seven tables enable RLS. **There are no client table privileges or client RLS policies**, even for approved notes or the signed-in owner. `anon` and `authenticated` cannot read/write base tables, resolve private helpers, or execute privileged RPCs. Do not add an approved-row SELECT policy: base rows contain private email. Keep `portfolio_private` out of Data API exposed schemas.

The Edge Function is the sole application data path and holds `SUPABASE_SERVICE_ROLE_KEY`. Its public listing explicitly selects and re-whitelists public fields. SQL privileged functions are `SECURITY DEFINER`, pin `search_path = pg_catalog`, fully qualify objects, and grant execution only to `service_role` (database-owner administration remains possible).

SQL helpers: `portfolio_is_admin` checks UUID membership; `portfolio_consume_rate` atomically consumes a window and runs bounded cleanup; `portfolio_submit` atomically saves source/dedup/request/outbox; `portfolio_moderate` rechecks the actor and supplies publication metadata; `portfolio_admin_counts` returns inbox/notification counts; `portfolio_claim_notifications` and `portfolio_finish_notification` manage fenced leases; `portfolio_cleanup` removes bounded expired helpers. These are backend RPCs, not browser endpoints.

`verify_jwt = false` in `supabase/config.toml` is required for public actions. Every admin action separately calls Supabase Auth `getUser(token)` and checks that validated user's UUID against the private allowlist. An email comparison in a browser, signing up with the owner email, or merely holding any valid JWT cannot grant access.

### Owner provisioning, URLs, and recovery

Perform this separately for local and hosted databases:

1. In Supabase Dashboard **Authentication → Users** (local: Studio's Auth UI), manually create a password-login user for **`chandrakarankit014@gmail.com`** with a unique password and mark the email confirmed. Do not use the application's public signup; it has no signup UI or auto-grant trigger.
2. Disable new/public user signups in Auth provider settings for this dedicated project. Local equivalent is `[auth] enable_signup = false` in local Supabase configuration, followed by restarting the stack; the committed minimal config does not currently set this. Admin-created users are provisioned manually.
3. Run the exact contents of `supabase/bootstrap-owner.sql` as the database owner, after the migration and confirmed Auth user exist. In hosted SQL Editor, paste/run that file. Locally, with `psql` installed and the default database port:

   ```sh
   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/bootstrap-owner.sql
   ```

   Use the actual database URL from `npx supabase status` if ports differ. The script resolves exactly one confirmed, non-deleted Auth UUID for the expected email and inserts it idempotently; a missing user fails and ambiguity fails. It is intentionally not an automatic migration/seed.
4. In **Authentication → URL Configuration**, set Auth's Site URL to the actual frontend origin (e.g. `https://portfolio.example.com`). Add exact redirect URLs `https://portfolio.example.com/admin/notes` and the local equivalents you use, e.g. `http://localhost:5173/admin/notes` and `http://127.0.0.1:5173/admin/notes`. Avoid broad production wildcards. Server `SITE_URL` is separately the canonical origin, with **no `/admin/notes` path**; the server appends that path to notification links.
5. Sign in directly at `/admin/notes` with the password. This uses `signInWithPassword`; **no OAuth/magic-link callback route is needed**.
6. Password recovery is an operator task: use Dashboard's owner-user management/password reset tools. If the dashboard offers only a recovery email/link, this SPA has no recovery form or `updateUser({password})` screen; complete recovery through a supported administrative password-update workflow (Dashboard or server-only Auth Admin tooling) before signing in again. Do not assume an emailed recovery link to `/admin/notes` changes the password. Auth email delivery/SMTP is separate from the portfolio Resend API configuration.

Removing the owner's allowlist row revokes admin API access on the next request. If an Auth account is recreated, its UUID changes: provision/confirm and explicitly bootstrap again. Approved-note attribution prevents deleting the approving Auth user until approvals are reassigned or unpublished.

## 3. Configuration: public browser values vs server secrets

### Browser `.env.local` from `.env.example`

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_WIDGET_SITE_KEY
```

For Docker-local Supabase, use the API URL/key printed by `npx supabase status` (usually `http://127.0.0.1:54321`). The URL must be a bare HTTPS origin, or HTTP localhost/loopback origin, without paths/query/fragments. A key must be an anon-role JWT or `sb_publishable_…` value. The client also accepts `VITE_SUPABASE_PUBLISHABLE_KEY` as a fallback, but use the documented `.env.example` variable `VITE_SUPABASE_ANON_KEY`; it takes precedence. A service-role JWT will be rejected by the client guard and must never be exposed.

These three values are public, embedded at build time. Restart Vite after edits; rebuild/redeploy after production changes. No `VITE_WEB3FORMS_KEY` is used by the current form.

### Server `supabase/.env.local` from `supabase/secrets.example`

| Variable | Required setup |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Hosted Supabase injects these. The local CLI also supplies local runtime credentials; never replace them with browser configuration or send them to Vercel's `VITE_*` build environment. |
| `ALLOWED_ORIGINS` | Comma-separated exact frontend origins: HTTPS production, HTTP localhost/loopback for development. No `*`, paths, trailing slash or `null`. Include the actual Vite port and hostname used. |
| `SITE_URL` | Canonical frontend origin used in notification dashboard links. Local example: `http://localhost:5173`. |
| `APP_ENV` | `production` hosted; `local` for an explicitly local stack. This alone never disables verification. |
| `TURNSTILE_SECRET_KEY` | Server Siteverify secret paired with the browser widget site key. |
| `TURNSTILE_HOSTNAMES` | Comma-separated exact returned hostname allowlist, e.g. `localhost,127.0.0.1,portfolio.example.com`; no scheme, port, path or wildcard. |
| `LOCAL_CAPTCHA_BYPASS` | Keep `false` for real local integration and production. Restricted opt-in developer behavior described below. |
| `IP_HASH_SECRET` | Generate at least 32 random bytes, e.g. `openssl rand -hex 32`, and paste the result. Runtime minimum is 32 characters; use stronger random entropy rather than a phrase. |
| `TRUSTED_IP_HEADER` | One of `x-forwarded-for`, `cf-connecting-ip`, `x-real-ip`, selected only after verifying ingress behavior. |
| `TRUSTED_IP_INDEX` | Integer list index, `0` first or `-1` last; supported absolute value ≤10. Must select the gateway-controlled address. |
| `RESEND_API_KEY` | Server-only sending key, preferably restricted to your verified sending domain. |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Portfolio <notifications@updates.example.com>`. |
| `OWNER_EMAIL` | Notification destination, normally `chandrakarankit014@gmail.com` (also the default). Changing this does not change admin authority. |

Keep real env files ignored. Never commit service-role, Resend, Turnstile secret or hash-secret values, and never put them in frontend source or `VITE_*` variables. The two example files contain placeholders, not working credentials. The server requires mail configuration even for routes that do not send mail; invalid/missing configuration produces a safe 503.

## 4. Turnstile and the trusted ingress boundary

### Cloudflare widget

1. In Cloudflare Turnstile, create a widget and add the actual frontend domain(s), plus localhost/loopback as appropriate for your development widget.
2. Put its **site key** in `VITE_TURNSTILE_SITE_KEY` and **secret key** only in server `TURNSTILE_SECRET_KEY`.
3. Set backend `TURNSTILE_HOSTNAMES` to the exact intended verification-result hostnames. Hostnames are distinct from origin URLs/ports.
4. Widgets send actions `portfolio-note` and `portfolio-message`. Backend Siteverify requires success, an allowed hostname, and the matching action. A valid token from another action/site is insufficient. Expired/failed tokens require widget refresh; CAPTCHA is checked even for matching idempotent replays.

Cloudflare's dummy test keys are for test environments only; their responses must still match this backend's hostname/action checks. The Playwright values below are entirely mocked and are not live Cloudflare credentials.

The explicit local bypass requires **all** of: `LOCAL_CAPTCHA_BYPASS=true`, `APP_ENV=local`, only localhost/loopback frontend origins and `SITE_URL`, a local HTTP `SUPABASE_URL` (loopback, `kong`, or `host.docker.internal`), and no hosted `DENO_DEPLOYMENT_ID`. The runtime refuses mixed hosted/production bypass configuration. A nonempty `captchaToken` and the browser's widget/site-key configuration are still required. There is no automatic bypass on missing keys or failed CAPTCHA. Use real verification for the mandatory live scenarios.

### IP verification is required locally and in production

**There is no trusted-header default that can be assumed safe on every Supabase deployment.** The example's `x-forwarded-for` / `-1` is only correct if your trusted gateway appends the actual peer IP as the rightmost value. A platform that overwrites one trusted header may instead require that header with index `0`.

Before accepting submissions:

1. Establish the ingress route: browser → local/hosted Supabase gateway or your trusted proxy → Edge Function. A frontend Vercel deployment alone does not define the function's IP-header trust boundary; the browser calls Supabase directly.
2. Verify gateway documentation/configuration and observe the selected header at the function boundary in a temporary controlled diagnostic. Do not persist raw visitor IPs or expose them in public responses. Test through the **same route** that browsers use.
3. Send forged `x-forwarded-for`, `x-real-ip`, and `cf-connecting-ip` values, including comma-separated chains. Confirm that the selected address is overwritten/appended by the gateway and cannot be chosen by the caller. Two requests differing only in forged headers must retain the same rate identity. Test absent/malformed selected values too.
4. Set `TRUSTED_IP_HEADER`/`TRUSTED_IP_INDEX` to the verified position and prevent alternate direct-to-runtime routes that bypass that gateway. If you cannot establish this boundary, finish ingress configuration before enabling submissions; do not silently disable the check or trust the leftmost caller value.

Local gateways sometimes omit forwarding headers. Configure a loopback-only trusted local proxy/gateway to **overwrite** a supported header with the actual peer IP (for example `x-real-ip`, index `0`) and route local browser function traffic through it. A manually supplied header in curl is a handler smoke test, not proof of a trustworthy ingress path. Missing/invalid selected addresses produce 403 for submissions even locally. Public listing and admin actions do not consume this submission IP check.

Raw IPs are not stored; only domain-separated HMAC-SHA256 rate identities are stored. IP is passed to Turnstile for verification. Rotating `IP_HASH_SECRET` resets rate/content identities, so rotate deliberately. The atomic rate window allows 10 validated submission attempts per IP per 10 minutes, shared across both form types and consumed before CAPTCHA/provider work. CORS is not authentication: no-Origin server requests are allowed but submissions still require IP/CAPTCHA/rate checks.

## 5. Resend account, DNS, and real delivery

1. Create/access a Resend account, preferably associated with **`chandrakarankit014@gmail.com`** if testing the default destination with their onboarding sender.
2. In Domains, add a domain/subdomain you own, such as `updates.example.com`. Gmail is the recipient mailbox, **not** a domain you can verify for sending. Use your domain's DNS provider to add the exact Resend records (names/values/region are project-specific): DKIM records and the SPF/return-path records, including any requested return-path MX. Do not replace your normal inbound-mail MX records. Avoid multiple SPF TXT records at the same hostname; merge an existing policy correctly where needed. Wait for DNS propagation and Resend's verified status.
3. Add DMARC at the appropriate `_dmarc` hostname, beginning with a monitored policy such as `p=none` and a reporting mailbox you control; check SPF/DKIM alignment and reports before enforcing quarantine/reject. Follow the domain-specific Resend instructions rather than copying another site's DNS values. Domain registration may cost money even when sending is within a free tier.
4. Create a dedicated API key with **Sending access** (sending-only), restricted to the verified domain when available. Save it once in server `RESEND_API_KEY`. Set `RESEND_FROM_EMAIL` to an address on that verified domain and keep `OWNER_EMAIL=chandrakarankit014@gmail.com`. A full-access account key is unnecessary for the function's `POST /emails` call.
5. For an initial test only, `Portfolio <onboarding@resend.dev>` can send **only to the email associated with the Resend account**. It works for this owner destination only if that account email is `chandrakarankit014@gmail.com`. A different Resend account email needs a verified custom sender domain before it can deliver to the owner. Use a verified sender for production.
6. Submit a uniquely identifiable real note and a real footer message through the configured website. Confirm database acceptance, pending/unread dashboard state, the actual owner inbox (including spam), and Resend's per-email delivery events/logs. Check `Reply-To`, content, submitted time/initial status, and the dashboard URL. Provider acceptance alone does not establish recipient delivery.

No Gmail password, app password, browser email client, or visitor mailbox login is involved. The backend sends with Resend's API key. Valid visitor email is used as `reply_to`; the verified domain remains the sender. Supabase Auth recovery emails use Auth's own mail transport/settings, not this notification outbox.

### Notification contract and failure recovery

- Note subject: **`New Portfolio Note — Pending Approval`**. Contact subject: **`New Portfolio Contact — ${subject}`**. Bodies are plaintext, not interpolated HTML, and include the source ID, name/email, message, source `created_at`, initial `pending`/`unread` status and `${SITE_URL}/admin/notes`. Note email explicitly says it is not yet published.
- Source row and outbox snapshot commit in one transaction before delivery is attempted. Later moderation/read changes do not rewrite the snapshot. Deleting a note neither recalls an email nor cancels its existing outbox payload.
- Initial submission tries its own notification. Dashboard **Retry notifications** manually claims at most 10 due rows; there is no mandatory scheduler. A replay of an accepted request does not create another outbox entry or automatically retry the old one.
- Claims use `FOR UPDATE SKIP LOCKED`, a 90-second lease and fencing UUID. Resend requests have an 8-second timeout and stable `Idempotency-Key: portfolio-<outbox UUID>`. Backoff starts at 60 seconds and doubles up to one hour, with at most eight attempts.
- Retries stop **23 hours after the first attempt**, including ambiguous timeouts, staying inside Resend's 24-hour idempotency window. Terminal `expired` rows are not resent by manual retry. An unattempted pending row can still be claimed while retained. Keep sender/recipient/site URL stable during this window to avoid changed-payload provider idempotency conflicts.
- The dashboard failure count includes failed/expired rows, abandoned processing leases and unclaimed pending rows older than 90 seconds. Active leases and fresh pending rows do not count. Retry can truthfully return `{sent:0,failed:0}` while work is in backoff/expired. Its counters describe that invocation, not all historic deliveries.
- Fix provider/key/domain/quota configuration, wait until due, then retry and inspect provider logs. Expired ambiguous sends require manual investigation of provider delivery history before any deliberate operator resend; there is no force-resend button. **Pending notes remain saved even when notification delivery fails.**
- Opportunistic cleanup removes at most 100 expired rows per helper table per submission attempt. Rate/content helpers expire after 10 minutes, request IDs after 24 hours, and **all outbox snapshots after 30 days from creation**, including unsent/failed/sent/expired payloads. On idle deployments or large backlogs, run `select public.portfolio_cleanup();` repeatedly as database owner/service context, or optionally schedule it. Cleanup does not delete notes/messages and does not require cron.

### Free tiers, quotas, and monitoring

Official pages were fetched **2026-11-01**. Prices, quotas and provider defaults change; recheck the linked pages and your account's dashboard before relying on these numbers.

| Service | Current practical limits/cost considerations |
| --- | --- |
| Resend transactional Free | **100 emails/day**, reset at midnight UTC; **3,000/month**. Sent and received mail both consume quota; each recipient counts separately. These notifications each target one owner. Current docs list up to 3 verified domains, a starting team-wide **10 requests/second** limit, and **30-day** email/event/log retention. Other applications sharing the team also consume these limits. Marketing quotas are separate and do not apply to these transactional notifications. |
| Supabase Free | 2 active projects, 500 MB database, 50,000 Auth MAU, 500,000 Edge invocations, 5 GB egress; free projects can pause after **one week of inactivity**. API/database log retention is **one day**, Auth audit logs **one hour**, and automatic backups are not included. Pro starts at $25/month with separate compute/usage rules; examine the current pricing rather than assuming every project is covered. |
| Turnstile / frontend host | Turnstile has a free plan; domain/widget limits and host bandwidth/build/function quotas are provider-plan dependent. Check current Cloudflare and Vercel/Netlify plan terms, including eligibility for your usage. This app needs a static frontend plus Supabase, not a separate paid mail server or required cron. |

Monitor Resend Usage, API logs, email delivery/bounce/complaint events and domain health, plus dashboard notification failures. Resend can pause sending for reputation issues (current docs: bounce rate ≥4% or spam rate ≥0.08% are problematic), even when below volume caps. Multiple simultaneous retry invocations or other services can exceed its team rate limit. The application does not persist provider response bodies/message IDs or mirror delivery webhooks; Resend's logs are the delivery source of truth.

Monitor Supabase project pause status, DB/helper/outbox growth, Edge invocations/egress, Auth errors and rate limits. Auth MAU allowance does not mean unlimited login/recovery email requests: Auth endpoint/IP/email limits apply independently. Supabase's default Auth email transport is limited and recipient-restricted; configure custom SMTP if needed for recovery workflows and check the live Auth rate-limit settings. Those emails also consume any connected provider's quota. Export necessary operational evidence before short free-tier logs expire.

Official references:

- [Resend quotas, limits and retention](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [Resend onboarding sender restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
- [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction), [DMARC](https://resend.com/docs/dashboard/domains/dmarc), [API keys](https://resend.com/docs/dashboard/api-keys/introduction)
- [Supabase pricing](https://supabase.com/pricing), [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits), [Auth SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)

## 6. Local setup, in order

Prerequisites: supported Node.js for Vite 7 (Node 22.12+ is a suitable choice), npm, Deno 2 for backend checks; Docker for a local Supabase stack; optional `psql` for SQL-file commands. Hosted-only development does not require Docker.

### A. Install and prepare public configuration

```sh
npm install
cp .env.example .env.local
cp supabase/secrets.example supabase/.env.local
npx supabase --version
```

`npx supabase` downloads/runs the CLI; use a reviewed/pinned CLI version in a repeatable team workflow. The repository already has `supabase/config.toml`; do not initialize over it. Edit the two env files separately using the tables above. Do not leave example production domains in local origins or `SITE_URL`.

### B. Choose the database target

**Docker-local:** start Docker, then:

```sh
npx supabase start
npx supabase status
npx supabase migration up --local
```

Startup can apply pending migrations already; the migration command applies any remaining local ones. Use the actual printed API, Studio and database URLs. A reset is unnecessary for normal setup; `db reset` destroys local data and would require provisioning/bootstrap again. Manually create/confirm the owner in Studio, configure local Auth signups/URLs as described above, then run `bootstrap-owner.sql`. Point browser env at the local API URL and public key. Set server `APP_ENV=local`, local origins and `SITE_URL`, local hostnames, real Turnstile secret, verified mail sender and trusted-header selection. Runtime Supabase URL/service credentials come from the local CLI.

**Hosted development alternative:** create a dedicated hosted Supabase project, apply the migration using the CLI sequence in section 9 or paste the migration into SQL Editor once, then manually provision/bootstrap the owner and configure Auth URLs/signups. Configure hosted secrets and deploy the function. Point browser env at that hosted project's API URL/public key and allow your exact localhost origin server-side. Do not use local CAPTCHA bypass with a hosted database. Do not apply the same migration both manually and via an unadjusted CLI migration history.

### C. Serve the local Edge Function and frontend

After configuring a trustworthy local ingress/header (section 4), in one terminal:

```sh
npx supabase functions serve portfolio-api --env-file supabase/.env.local
```

The committed function configuration disables gateway JWT enforcement for public actions. If a CLI version requires it explicitly when serving, the equivalent flag is `--no-verify-jwt`; the handler still enforces every admin action. Keep server secrets in the function env file, not frontend `.env.local`.

In another terminal:

```sh
npm run dev -- --port 5173 --strictPort
```

Open `http://localhost:5173/notes` and `/admin/notes`. Using `127.0.0.1` instead requires corresponding origins/redirects/widget hostnames. When using a custom loopback proxy, the frontend backend URL must reach that verified proxy route while forwarding the necessary Supabase Auth/API routes. Do not assume `functions serve` alone supplies a trustworthy selected header. There is no IP-check bypass configuration.

For a JSON listing smoke test (no IP or CAPTCHA is needed for listing):

```sh
curl --fail-with-body http://127.0.0.1:54321/functions/v1/portfolio-api \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_LOCAL_PUBLIC_KEY" \
  -H "Origin: http://localhost:5173" \
  --data '{"action":"list-notes","offset":0,"limit":12}'
```

Use your actual API URL/public key. For submission smoke tests, include the header selected in your local setup, e.g. `-H "x-real-ip: 127.0.0.1"` **only** when testing the handler behind a controlled loopback route configured for `x-real-ip`/`0`. This does not substitute for verifying that browser ingress overwrites caller-supplied values. Real form submissions also need the valid action-specific CAPTCHA token and UUID below.

## 7. Actual Edge Function contracts

Endpoint: `${VITE_SUPABASE_URL}/functions/v1/portfolio-api`. Send JSON **POST**, `Content-Type: application/json`, `apikey: <public key>` as the frontend does; add `Authorization: Bearer <owner access token>` for admin actions. `OPTIONS` returns configured CORS headers. Responses are JSON and `Cache-Control: no-store`; requests are limited to 32 KiB of uncompressed JSON. Compression is rejected. The function does not expose arbitrary provider/database errors.

| Action | Request fields besides `action` | Success response |
| --- | --- | --- |
| `list-notes` | `offset?: 0`, `limit?: 12` | `{notes:[{id,name,message,approved_at}],hasMore}`; approved only. |
| `submit-note` | `name`, optional `email`, `message`, `botcheck: ""`, `captchaToken`, `idempotencyKey: UUID` | `{success:true}`; saved pending, never self-published. |
| `submit-message` | `name`, required `email`, `subject`, `message`, `botcheck: ""`, `captchaToken`, `idempotencyKey: UUID` | `{success:true}`; saved unread/private. |
| `list-admin` | Owner JWT; `tab: "pending" | "approved" | "rejected" | "messages"`, `offset?: 0`, `limit?: 20` | `{notes:[…],hasMore,counts:{pending,approved,rejected,unread},notificationFailures}`; messages tab returns `messages` instead of `notes`. |
| `moderate-note` | Owner JWT; `id: UUID`, `status: "approved" | "rejected"` | `{success:true}` |
| `delete-note` | Owner JWT; `id: UUID` | `{success:true}` |
| `update-message` | Owner JWT; `id: UUID`, `status: "unread" | "read" | "archived"` | `{success:true}` |
| `retry-notifications` | Owner JWT; no further fields | `{sent,failed}` for up to 10 due claims. |

Admin note fields: `id,name,email,message,created_at,status,approved_at`; message fields: `id,name,email,subject,message,created_at,status`. Messages tab includes all message statuses. Admin ordering is `created_at DESC,id DESC`. `offset` must be an integer 0–100000 and `limit` an integer 1–100; lookahead determines `hasMore`.

Validation trims strings, lowercases email, converts blank optional note email to NULL and counts Unicode code points: name ≤100, email ≤254, note ≤500, subject ≤150, contact message ≤5000. Required values cannot be whitespace-only. Names/emails/subjects reject controls; messages permit newlines/tabs but reject other ASCII controls. `botcheck` must be present and exactly empty. Client UI renders user text without HTML; SQL constraints independently enforce data validity.

Example note body (replace token/UUID with real values; admin fields are not accepted as publication authority):

```json
{
  "action": "submit-note",
  "name": "A visitor",
  "email": "visitor@example.com",
  "message": "Thank you for sharing your work.",
  "botcheck": "",
  "captchaToken": "ACTION_SPECIFIC_TURNSTILE_TOKEN",
  "idempotencyKey": "6d34596e-5bf4-4f20-b3f0-4e4282b90662"
}
```

All errors have `{error:"safe human message"}`: 400 invalid JSON/input/action/pagination; 401 missing/invalid session; 403 disallowed origin, failed CAPTCHA, untrusted/missing IP or non-owner; 404 missing mutation target; 405 wrong method; 409 conflicting request ID/duplicate content; 413 oversized body; 415 wrong content type/encoding; 429 rate window; 500 unexpected server/Auth/database failure; 503 unavailable CAPTCHA/configuration. The browser applies its own safe error mapping; contact forms may show generic failure plus a validation/security hint.

For an uncertain request outcome, keep the same submission UUID and normalized content, and obtain fresh CAPTCHA as necessary. Same-key/content replays return success without duplicate data; a different key does not bypass the 10-minute content block. The browser keeps this identity for unchanged retries during the mounted form lifetime, not across a full page reload. Rate and CAPTCHA checks still apply on replay.

## 8. Verification: mocked, local database, and mandatory live scenarios

Run and record results yourself; the commands below are instructions, not reported results.

### Automated frontend/backend checks

```sh
npm run build
npm run lint
npx eslint src/App.jsx src/components/Header.jsx src/components/Contact.jsx src/components/SubmissionForm.jsx src/components/Turnstile.jsx src/lib/supabase.js src/lib/portfolio-api.js src/pages/Notes.jsx src/pages/AdminNotes.jsx tests/e2e/notes.spec.js playwright.config.js
deno test --config supabase/deno.json --allow-read tests/backend
deno check --config supabase/deno.json supabase/functions/portfolio-api/index.ts
deno lint --config supabase/deno.json supabase/functions/portfolio-api tests/backend
npx playwright install chromium
```

Use installed Deno 2; the old native npm-cache binary path recorded in `supabase/README.md` is machine-specific. Backend tests use mocked external boundaries and a real PostgreSQL WASM engine (PGlite), with minimal Supabase Auth fixtures. They do not call hosted Auth, Turnstile or Resend. Full lint can surface unrelated portfolio issues; targeted lint narrows the relevant feature files without replacing the full check.

Run the **full configured Playwright suite** (all five configured viewport projects, not only a desktop smoke test):

```sh
VITE_SUPABASE_URL=https://notes-test.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_publishable_browser_test_key \
VITE_TURNSTILE_SITE_KEY=browser-test-site-key \
PLAYWRIGHT_PORT=52831 npm run test:e2e
```

The test URL and keys above are **mock-only public values**, not credentials. Tests intercept API/Auth/Turnstile traffic. Without valid-shaped public configuration, configured cases skip. The default port is **5189**, which is busy in the originating workspace; `52831` is an example free-port override. Select another unused port if necessary. The config uses `reuseExistingServer:false` and `--strictPort`, so an occupied port fails rather than accidentally testing another server. Inline environment values are inherited by the test-managed Vite server and override `.env.local` for that run.

To exercise unconfigured states separately, run with all public backend aliases/site key empty:

```sh
VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= VITE_SUPABASE_PUBLISHABLE_KEY= VITE_TURNSTILE_SITE_KEY= PLAYWRIGHT_PORT=52831 npm run test:e2e
```

Configured-only cases intentionally skip in that run. Review the test report's skipped cases rather than treating them as verified integrations. Mocked tests cover validation/retries, states, private data clearing, pagination, moderation/inbox behavior and responsive layouts; **they do not prove real email delivery or gateway/RLS behavior on a hosted project**.

### Full local database pgTAP

With Docker/local Supabase running and migrations applied:

```sh
npx supabase test db supabase/tests/portfolio_security.test.sql
```

The suite runs a rolled-back transaction against the actual local stack, testing role denials, RLS/grants/RPCs, atomic persistence, moderation and outbox behavior. Also exercise PostgREST/Auth/Edge integration through the running stack; PGlite cannot validate those platform boundaries. Neither pgTAP nor mocked backend tests proves live mail delivery.

### Mandatory live scenario matrix

Use the actual configured function, Auth user, real action-specific Turnstile widget, verified ingress, database and Resend sender. Repeat core routes/delivery checks against the production origin after deployment. Use clearly labeled test content and record IDs/timestamps without publishing real private emails.

| Scenario | Required evidence |
| --- | --- |
| Submit a note with private email | Browser success; exactly one pending DB/dashboard row; not present on public wall or public JSON before approval; actual owner notification arrives. |
| Approve that note | Owner password login succeeds; approve works; fresh wall/list response publishes only four public fields; private email is absent from browser public data, DOM and page source. |
| Reject/unpublish and delete | Rejected note disappears after refresh and approval metadata clears; rejection of another pending note never publishes it; delete removes source row. Existing notification snapshot retention remains independent. |
| Footer private contact | Required name/email/subject/message save one unread private message; real owner inbox receives matching notification with correct subject, body, Reply-To and dashboard link. Form submission does not launch an email app or navigate to mailto. Mark read/unread/archive and reload. |
| Authorization failures | Logged-out admin call gets 401; a manually created test non-owner's JWT gets 403; owner access returns only after UUID bootstrap. Invalid/expired session clears private dashboard content. Disable public signups again after any test-account provisioning. |
| Direct database access | Through real PostgREST as `anon` and `authenticated` (including owner's JWT), SELECT/INSERT/UPDATE/DELETE on notes/messages and privileged RPC calls fail; private schema is unexposed. Approved notes do not become directly readable. Confirm grants with pgTAP/owner SQL too. |
| CAPTCHA/origin/IP boundary | Wrong action/hostname/token and forbidden origin fail; missing/invalid selected IP fails on submission; forged forwarding headers cannot change the gateway-selected identity locally or in production. No secret/bypass workaround is enabled. |
| Rate/idempotency | Same payload/key with valid verification does not duplicate; conflicting key/payload or fresh-key duplicate gives 409; 11th validated attempt in the shared window gives 429. Use controlled testing and avoid consuming provider quotas unnecessarily. |
| Notification failure and recovery | In a development project, force a controlled provider failure; note/message remains accepted and private/pending; failure count becomes visible; restore configuration, wait for due backoff and manually retry. Check provider delivery logs for duplicates. Verify terminal expiry/retention through controlled DB tests rather than waiting 30 days. |
| Responsive/direct URLs | Direct-load and refresh `/notes` and `/admin/notes` on deployed host; keyboard, mobile, 320px and tablet forms/dashboard remain usable; inspect browser console and Network failures. Sign out clears private entries and stops private polling. |

## 9. Production deployment order (Vercel or another static host)

1. Reserve the final frontend origin and choose the hosted Supabase project. Register/verify the Resend sending domain/DNS, create its sending key, and create a Turnstile widget for the final hostname. Establish the Supabase/proxy IP trust boundary before accepting live submissions.
2. Apply the migration first. With CLI-managed migrations:

   ```sh
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

   Inspect the linked project and pending migrations before pushing. Alternatively run the migration manually in hosted SQL Editor once and manage migration history consistently; do not blindly replay table-creation SQL.
3. Manually provision/confirm the owner Auth user, disable public signups, set Auth Site URL/redirect allowlist and execute `supabase/bootstrap-owner.sql` in SQL Editor. Verify UUID membership as database owner.
4. Create a separate ignored production secrets file (e.g. `supabase/.env.production`) from the server example and fill real values: exact final/needed local origins, canonical server `SITE_URL`, production Turnstile secret/hostnames, cryptographically random hash secret, verified IP header/index, Resend sender/key and owner recipient. Set `APP_ENV=production`, `LOCAL_CAPTCHA_BYPASS=false`; omit CLI/platform-supplied `SUPABASE_*` values from uploaded secrets.

   ```sh
   npx supabase secrets set --env-file supabase/.env.production --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy portfolio-api --project-ref YOUR_PROJECT_REF
   ```

   Deployment uses the committed `verify_jwt=false`; do not enable gateway JWT enforcement that would block the public action contract. Verify the function's startup configuration, listing/CORS behavior and trusted ingress through the final API route.
5. In Vercel configure framework **Vite**, install command `npm install`, build command `npm run build`, output **`dist`**. Add only the three public `.env.example` variables to the intended deployment environment(s) using hosted Supabase URL/public key and real Turnstile site key. Preview deployments need their own deliberately allowed origins/hostnames; production-only configuration does not automatically authorize random preview domains.
6. Deploy the frontend after backend migration/bootstrap/secrets/function are ready. The repository's **existing `vercel.json`** rewrites `/notes`, `/admin/notes`, `/about`, `/desk`, `/playtime` and `/work/:path*` to `index.html`. Keep these SPA rules. **`public/_redirects`** preserves the equivalent Netlify/Cloudflare Pages rules and is copied by Vite; it is not the Vercel configuration. On another host provide equivalent direct-route fallbacks. The browser calls Supabase directly; no Vercel email API or service-role environment variable is needed.
7. Open production `/notes`, `/admin/notes` and footer, refresh deep links, then complete the live matrix above. Confirm **real owner email delivery and provider logs**, not only successful frontend messages/builds. Record actual checks separately. Rebuild frontend if public env changes; update function secrets/redeploy as needed when server configuration changes, keeping retry-window mail payload settings stable.

## 10. Configuration gaps to resolve explicitly

- `supabase/config.toml` currently contains only the project ID, function JWT setting and disabled seeds. Owner creation, signup disabling, Auth Site URL/redirect allowlist, ingress trust and provider accounts/keys are manual configuration; none is established by that file or this documentation.
- `supabase/secrets.example` mixes localhost `5173` origins with a placeholder production `SITE_URL` and uses `APP_ENV=production`. It is a template, not a ready-to-run local file. Use actual URLs/ports and remove production placeholders for local-only setup; default Vite port, workspace preview ports and Playwright ports are different contexts.
- The example's rightmost `x-forwarded-for` selection is **unverified per deployment**. A valid-looking IP string is not proof of trusted origin. No automatic local/production ingress adaptation exists.
- Browser `VITE_SUPABASE_PUBLISHABLE_KEY` fallback is implemented but absent from `.env.example`; the documented three-variable setup uses `VITE_SUPABASE_ANON_KEY` for either accepted public-key shape.
- Password recovery UI is not implemented. Auth URL configuration alone does not add a reset-password form, and portfolio Resend secrets do not configure Auth SMTP.
- Notification `sent` means the provider accepted the request and the worker finished its lease, not guaranteed inbox delivery. Provider delivery logs and a real inbox check remain required.

## 11. Recorded implementation verification

Completed locally on 2026-11-01:

- `npm run build`: passed, including the existing asset precheck.
- `npm run lint`: passed for the whole project.
- Native Deno backend suite: **16 passed**, including the migration executed in PGlite PostgreSQL, role/RPC denials, moderation, idempotency, rate limits and notification recovery.
- Native Deno Edge Function type-check and backend lint: passed.
- Configured Playwright suite: **100 passed across five viewport projects**; the five unconfigured-only cases intentionally skipped in that run. External Auth, CAPTCHA and API traffic was mocked.
- Separate unconfigured-state run: **10 passed across five viewport projects**.
- Additional browser smoke checks verified desktop/mobile navigation, no console errors or uncaught page errors on the Notes smoke path, and no horizontal overflow. Desktop and 320px full-page screenshots were visually inspected; the security widget in those screenshots is a test double.
- Independent backend/frontend review findings were corrected, including notification metadata/links and stable accessible form labels after validation errors.

Not executed: Docker-local Supabase/pgTAP, live Auth login/authorization, production gateway/IP trust tests, live Turnstile, actual Resend delivery, or hosted deployment. Those require the accounts, secrets, owner provisioning and deployment configuration described above. Mocked tests and PGlite do not establish those external integrations.
