-- All application access is mediated by portfolio-api. No client role can
-- inspect even approved base rows: they contain private email addresses.
create schema if not exists portfolio_private;
revoke all on schema portfolio_private from public, anon, authenticated;
grant usage on schema portfolio_private to service_role;

-- The positive content check excludes JavaScript trim()'s full Unicode
-- whitespace set (including NBSP/BOM), not just SQL btrim()'s ASCII space.
-- PostgreSQL text already rejects NUL; remaining ASCII controls are checked
-- explicitly, allowing only TAB/CR/LF inside multiline message content.
create table public.portfolio_notes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 100
    and name ~ U&'[^\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]'
    and name !~ U&'[\0001-\001F\007F]'),
  email text check (email is null or (email = btrim(email) and char_length(email) <= 254
    and email !~ U&'[\0001-\001F\007F]' and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  message text not null check (message = btrim(message) and char_length(message) between 1 and 500
    and message ~ U&'[^\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]'
    and message !~ U&'[\0001-\0008\000B\000C\000E-\001F\007F]'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  constraint publication_consistent check (
    (status = 'approved' and approved_at is not null and approved_by is not null)
    or (status <> 'approved' and approved_at is null and approved_by is null)
  )
);
create index portfolio_notes_public_order on public.portfolio_notes (approved_at desc, id desc) where status = 'approved';
create index portfolio_notes_admin_order on public.portfolio_notes (status, created_at desc, id desc);

create table public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 100
    and name ~ U&'[^\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]'
    and name !~ U&'[\0001-\001F\007F]'),
  email text not null check (email = btrim(email) and char_length(email) <= 254
    and email !~ U&'[\0001-\001F\007F]' and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text not null check (subject = btrim(subject) and char_length(subject) between 1 and 150
    and subject ~ U&'[^\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]'
    and subject !~ U&'[\0001-\001F\007F]'),
  message text not null check (message = btrim(message) and char_length(message) between 1 and 5000
    and message ~ U&'[^\0009-\000D\0020\00A0\1680\2000-\200A\2028\2029\202F\205F\3000\FEFF]'
    and message !~ U&'[\0001-\0008\000B\000C\000E-\001F\007F]'),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);
create index portfolio_messages_admin_order on public.portfolio_messages (created_at desc, id desc);
create index portfolio_messages_status_order on public.portfolio_messages (status, created_at desc, id desc);

create table portfolio_private.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table portfolio_private.rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  expires_at timestamptz not null
);
create table portfolio_private.submissions (
  idempotency_key uuid primary key,
  kind text not null check (kind in ('note', 'message')),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null
);
create index portfolio_submissions_expiry on portfolio_private.submissions (expires_at);
create table portfolio_private.content_dedup (
  content_hash text primary key check (content_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null
);
create index portfolio_content_expiry on portfolio_private.content_dedup (expires_at);
create index portfolio_rate_expiry on portfolio_private.rate_limits (expires_at);

-- Payload deliberately survives deletion of the original note until delivery/
-- retention cleanup. Only service_role can read it.
create table portfolio_private.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('note', 'message')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'failed', 'sent', 'expired')),
  attempts integer not null default 0 check (attempts between 0 and 8),
  created_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  lease_token uuid,
  sent_at timestamptz
);
create index portfolio_outbox_queue on portfolio_private.notification_outbox (status, next_attempt_at);
create index portfolio_outbox_expiry on portfolio_private.notification_outbox (created_at);

alter table public.portfolio_notes enable row level security;
alter table public.portfolio_messages enable row level security;
alter table portfolio_private.portfolio_admins enable row level security;
alter table portfolio_private.rate_limits enable row level security;
alter table portfolio_private.submissions enable row level security;
alter table portfolio_private.content_dedup enable row level security;
alter table portfolio_private.notification_outbox enable row level security;
-- Intentionally no anon/authenticated policies. service_role bypasses RLS.
revoke all on public.portfolio_notes, public.portfolio_messages from public, anon, authenticated;
revoke all on all tables in schema portfolio_private from public, anon, authenticated;
grant select, insert, update, delete on public.portfolio_notes, public.portfolio_messages to service_role;
grant select, insert, update, delete on all tables in schema portfolio_private to service_role;

create function public.portfolio_is_admin(p_user_id uuid) returns boolean
language sql stable security definer set search_path = pg_catalog
as $$ select exists (select 1 from portfolio_private.portfolio_admins where user_id = p_user_id) $$;

-- Bounded opportunistic cleanup: at most 100 rows/table per call. Can also run
-- manually or via an optional scheduler; no IP/token/provider errors are stored.
create function public.portfolio_cleanup() returns void
language plpgsql security definer set search_path = pg_catalog
as $$
begin
  delete from portfolio_private.rate_limits where ip_hash in
    (select ip_hash from portfolio_private.rate_limits where expires_at < now() limit 100 for update skip locked);
  delete from portfolio_private.submissions where idempotency_key in
    (select idempotency_key from portfolio_private.submissions where expires_at < now() limit 100 for update skip locked);
  delete from portfolio_private.content_dedup where content_hash in
    (select content_hash from portfolio_private.content_dedup where expires_at < now() limit 100 for update skip locked);
  delete from portfolio_private.notification_outbox where id in
    (select id from portfolio_private.notification_outbox where created_at < now() - interval '30 days' limit 100 for update skip locked);
end $$;

create function public.portfolio_consume_rate(p_ip_hash text) returns boolean
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_hits integer;
begin
  perform public.portfolio_cleanup();
  insert into portfolio_private.rate_limits as r (ip_hash, window_start, hits, expires_at)
  values (p_ip_hash, now(), 1, now() + interval '10 minutes')
  on conflict (ip_hash) do update set
    hits = case when r.expires_at <= now() then 1 else least(r.hits + 1, 11) end,
    window_start = case when r.expires_at <= now() then now() else r.window_start end,
    expires_at = case when r.expires_at <= now() then now() + interval '10 minutes' else r.expires_at end
  returning hits into v_hits;
  return v_hits <= 10;
end $$;

-- Serializes both idempotency keys and content hashes, including concurrent
-- requests using DIFFERENT keys. All data + notification writes commit together.
create function public.portfolio_submit(
  p_kind text, p_key uuid, p_hash text, p_name text, p_email text,
  p_message text, p_subject text default null
) returns jsonb
language plpgsql security definer set search_path = pg_catalog
as $$
declare
  v_previous portfolio_private.submissions%rowtype;
  v_id uuid;
  v_created_at timestamptz;
  v_status text;
  v_outbox uuid;
begin
  if p_kind not in ('note', 'message') then raise exception 'invalid kind'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_key::text, 0));
  select * into v_previous from portfolio_private.submissions where idempotency_key = p_key and expires_at > now();
  if found then
    if v_previous.kind = p_kind and v_previous.content_hash = p_hash then
      return jsonb_build_object('outcome', 'duplicate');
    end if;
    return jsonb_build_object('outcome', 'conflict');
  end if;
  insert into portfolio_private.content_dedup as d (content_hash, expires_at)
  values (p_hash, now() + interval '10 minutes')
  on conflict (content_hash) do update set expires_at = excluded.expires_at
    where d.expires_at <= now();
  if not found then return jsonb_build_object('outcome', 'conflict'); end if;
  if p_kind = 'note' then
    insert into public.portfolio_notes(name, email, message) values (p_name, p_email, p_message)
      returning id, created_at, status into v_id, v_created_at, v_status;
  else
    insert into public.portfolio_messages(name, email, subject, message) values (p_name, p_email, p_subject, p_message)
      returning id, created_at, status into v_id, v_created_at, v_status;
  end if;
  insert into portfolio_private.submissions(idempotency_key, kind, content_hash, expires_at)
  values (p_key, p_kind, p_hash, now() + interval '24 hours')
  on conflict (idempotency_key) do update set kind = excluded.kind, content_hash = excluded.content_hash, expires_at = excluded.expires_at;
  insert into portfolio_private.notification_outbox(kind, payload)
  values (p_kind, jsonb_build_object('id', v_id, 'name', p_name, 'email', p_email, 'subject', p_subject,
    'message', p_message, 'created_at', v_created_at, 'status', v_status)) returning id into v_outbox;
  return jsonb_build_object('outcome', 'created', 'notification_id', v_outbox);
end $$;

create function public.portfolio_moderate(p_id uuid, p_status text, p_admin uuid) returns boolean
language plpgsql security definer set search_path = pg_catalog
as $$
begin
  if not public.portfolio_is_admin(p_admin) or p_status not in ('approved', 'rejected') then return false; end if;
  update public.portfolio_notes set status = p_status,
    approved_at = case when p_status = 'approved' then coalesce(approved_at, now()) else null end,
    approved_by = case when p_status = 'approved' then p_admin else null end
  where id = p_id;
  return found;
end $$;

-- Each claim has a fencing token: a stale worker cannot finish a newer lease.
-- Resend retains idempotency keys for 24h. Stop at 23h after first attempt,
-- including uncertain outcomes, rather than risk sending a duplicate later.
create function public.portfolio_claim_notifications(p_id uuid default null, p_limit integer default 10)
returns setof portfolio_private.notification_outbox
language plpgsql security definer set search_path = pg_catalog
as $$
begin
  update portfolio_private.notification_outbox set status = 'expired', lease_until = null, lease_token = null
  where id in (select id from portfolio_private.notification_outbox
    where status in ('pending', 'failed', 'processing')
      and (lease_until is null or lease_until <= now())
      and (first_attempt_at <= now() - interval '23 hours' or attempts >= 8)
    limit 100 for update skip locked);
  return query
  with candidates as (
    select id from portfolio_private.notification_outbox
    where (p_id is null or id = p_id)
      and status in ('pending', 'failed', 'processing') and attempts < 8
      and next_attempt_at <= now() and (lease_until is null or lease_until <= now())
      and (first_attempt_at is null or first_attempt_at > now() - interval '23 hours')
    order by created_at limit greatest(1, least(p_limit, 10)) for update skip locked
  )
  update portfolio_private.notification_outbox o set status = 'processing',
    attempts = o.attempts + 1, first_attempt_at = coalesce(o.first_attempt_at, now()),
    lease_until = now() + interval '90 seconds', lease_token = gen_random_uuid()
  from candidates c where o.id = c.id returning o.*;
end $$;

create function public.portfolio_finish_notification(p_id uuid, p_lease uuid, p_sent boolean) returns boolean
language plpgsql security definer set search_path = pg_catalog
as $$
begin
  update portfolio_private.notification_outbox set
    status = case when p_sent then 'sent' when attempts >= 8 then 'expired' else 'failed' end,
    sent_at = case when p_sent then now() else null end,
    next_attempt_at = now() + make_interval(secs => least(3600, (30 * power(2, attempts))::integer)),
    lease_until = null, lease_token = null
  where id = p_id and status = 'processing' and lease_token = p_lease;
  return found;
end $$;

create function public.portfolio_admin_counts() returns jsonb
language sql stable security definer set search_path = pg_catalog
as $$
  select jsonb_build_object(
    'pending', (select count(*) from public.portfolio_notes where status = 'pending'),
    'approved', (select count(*) from public.portfolio_notes where status = 'approved'),
    'rejected', (select count(*) from public.portfolio_notes where status = 'rejected'),
    'unread', (select count(*) from public.portfolio_messages where status = 'unread'),
    'notificationFailures', (select count(*) from portfolio_private.notification_outbox
      where status in ('failed', 'expired') or (status = 'processing' and lease_until <= now())
        or (status = 'pending' and created_at < now() - interval '90 seconds'))
  )
$$;

revoke all on function public.portfolio_is_admin(uuid), public.portfolio_cleanup(),
  public.portfolio_consume_rate(text), public.portfolio_submit(text, uuid, text, text, text, text, text),
  public.portfolio_moderate(uuid, text, uuid), public.portfolio_claim_notifications(uuid, integer),
  public.portfolio_finish_notification(uuid, uuid, boolean), public.portfolio_admin_counts()
  from public, anon, authenticated;
grant execute on function public.portfolio_is_admin(uuid), public.portfolio_cleanup(),
  public.portfolio_consume_rate(text), public.portfolio_submit(text, uuid, text, text, text, text, text),
  public.portfolio_moderate(uuid, text, uuid), public.portfolio_claim_notifications(uuid, integer),
  public.portfolio_finish_notification(uuid, uuid, boolean), public.portfolio_admin_counts()
  to service_role;
