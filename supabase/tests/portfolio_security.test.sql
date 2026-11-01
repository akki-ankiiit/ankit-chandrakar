begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok(not has_schema_privilege('anon', 'portfolio_private', 'USAGE'), 'anon cannot resolve private helpers');
select ok(not has_schema_privilege('authenticated', 'portfolio_private', 'USAGE'), 'authenticated cannot resolve private helpers');
select ok(not has_table_privilege('anon', 'public.portfolio_notes', 'SELECT'), 'anon cannot read private note emails');
select ok(not has_table_privilege('authenticated', 'public.portfolio_notes', 'SELECT'), 'authenticated cannot read base notes');
select ok(not has_table_privilege('anon', 'public.portfolio_messages', 'SELECT'), 'anon cannot read messages');
select ok(not has_table_privilege('authenticated', 'public.portfolio_messages', 'UPDATE'), 'authenticated cannot modify message state');
select ok(not has_table_privilege('anon', 'public.portfolio_notes', 'INSERT'), 'anon cannot bypass CAPTCHA with a direct insert');
select ok(not has_table_privilege('authenticated', 'public.portfolio_notes', 'UPDATE'), 'authenticated cannot approve directly');
select ok(not has_table_privilege('authenticated', 'public.portfolio_notes', 'DELETE'), 'authenticated cannot delete directly');
select ok(has_table_privilege('service_role', 'public.portfolio_notes', 'SELECT'), 'backend can select explicit projections');

select ok(c.relrowsecurity, n.nspname || '.' || c.relname || ' has RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where (n.nspname = 'portfolio_private' and c.relkind = 'r')
  or (n.nspname = 'public' and c.relname in ('portfolio_notes', 'portfolio_messages'));
select ok(not has_function_privilege('anon', p.oid, 'EXECUTE'), p.proname || ' denies anon execute')
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like 'portfolio_%';
select ok(not has_function_privilege('authenticated', p.oid, 'EXECUTE'), p.proname || ' denies authenticated execute')
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like 'portfolio_%';
select ok(p.proconfig @> array['search_path=pg_catalog'], p.proname || ' pins privileged search_path')
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like 'portfolio_%';

set local role anon;
select throws_ok('select email from public.portfolio_notes', '42501', 'permission denied for table portfolio_notes', 'anon SELECT is rejected, not merely filtered');
select throws_ok($$insert into public.portfolio_notes(name,message) values ('Bypass','No CAPTCHA')$$, '42501', 'permission denied for table portfolio_notes', 'anon direct write rejected');
select throws_ok('select * from public.portfolio_messages', '42501', 'permission denied for table portfolio_messages', 'anon cannot list contact messages');
select throws_ok($$select public.portfolio_consume_rate(repeat('a',64))$$, '42501', 'permission denied for function portfolio_consume_rate', 'anon cannot call helper RPC');
reset role;

set local role authenticated;
select throws_ok($$update public.portfolio_notes set status = 'approved', approved_at = now(), approved_by = gen_random_uuid()$$, '42501', 'permission denied for table portfolio_notes', 'signed-in user cannot self-approve');
select throws_ok($$update public.portfolio_messages set status = 'archived'$$, '42501', 'permission denied for table portfolio_messages', 'signed-in user cannot archive messages directly');
select throws_ok('select * from portfolio_private.portfolio_admins', '42501', 'permission denied for schema portfolio_private', 'signed-in user cannot inspect/administer UUID allowlist');
select throws_ok('select public.portfolio_admin_counts()', '42501', 'permission denied for function portfolio_admin_counts', 'signed-in user cannot bypass Edge auth via RPC');
reset role;

-- Real confirmed Auth fixture, rolled back at the end. No hosted user mutation.
insert into auth.users(id, email, email_confirmed_at)
values ('10000000-0000-4000-8000-000000000001', 'backend-test@example.com', now());
insert into portfolio_private.portfolio_admins(user_id)
values ('10000000-0000-4000-8000-000000000001');
select ok(public.portfolio_is_admin('10000000-0000-4000-8000-000000000001'), 'explicit UUID is an admin');
select ok(not public.portfolio_is_admin('10000000-0000-4000-8000-000000000002'), 'other UUIDs are not admins');

set local role service_role;
select is(public.portfolio_submit('note', '20000000-0000-4000-8000-000000000001', repeat('b',64), 'Ada', 'private@example.com', 'A note')->>'outcome', 'created', 'service submission succeeds');
select is((select count(*)::integer from public.portfolio_notes where message = 'A note'), 1, 'one note persisted');
select is((select status from public.portfolio_notes where message = 'A note'), 'pending', 'server always inserts pending');
select is((select count(*)::integer from portfolio_private.notification_outbox where payload->>'message' = 'A note'), 1, 'notification created atomically');
select ok((select (o.payload->>'created_at')::timestamptz=n.created_at and o.payload->>'status'=n.status
  from portfolio_private.notification_outbox o join public.portfolio_notes n on n.id=(o.payload->>'id')::uuid
  where n.message='A note'), 'outbox captures actual source timestamp and initial status');
select ok(exists (select 1 from pg_indexes where schemaname='public' and tablename='portfolio_messages'
  and indexname='portfolio_messages_status_order' and indexdef like '%(status, created_at DESC, id DESC)'), 'message status has creation-order composite index');
update portfolio_private.notification_outbox set created_at=now()-interval '91 seconds' where payload->>'message'='A note';
select ok((public.portfolio_admin_counts()->>'notificationFailures')::integer >= 1, 'unclaimed overdue pending notification is visible');
update portfolio_private.notification_outbox set created_at=now() where payload->>'message'='A note';
select throws_ok($$insert into public.portfolio_notes(name,message) values ('Ada',E'\t\n')$$, '23514', null, 'SQL rejects whitespace-only note content');
select throws_ok($$insert into public.portfolio_notes(name,message) values (E'Ada\tX','Hello')$$, '23514', null, 'SQL rejects name controls');
select throws_ok($$insert into public.portfolio_messages(name,email,subject,message) values ('Ada','ada@example.com',E'\t\n','Hello')$$, '23514', null, 'SQL rejects whitespace-only contact subject');
select throws_ok($$insert into public.portfolio_messages(name,email,subject,message) values ('Ada',E'ada\001@example.com','Project','Hello')$$, '23514', null, 'SQL rejects email controls');
select is(public.portfolio_submit('note', '20000000-0000-4000-8000-000000000001', repeat('b',64), 'Ada', 'private@example.com', 'A note')->>'outcome', 'duplicate', 'same key/content is idempotent');
select is(public.portfolio_submit('note', '20000000-0000-4000-8000-000000000002', repeat('b',64), 'Ada', 'private@example.com', 'A note')->>'outcome', 'conflict', 'fresh key cannot bypass content dedup');
select is(public.portfolio_submit('note', '20000000-0000-4000-8000-000000000001', repeat('c',64), 'Ada', null, 'Changed')->>'outcome', 'conflict', 'same key with changed content rejected');
select is((select count(*)::integer from public.portfolio_notes where message = 'A note'), 1, 'duplicates did not insert');
select throws_ok($$select public.portfolio_submit('message', '20000000-0000-4000-8000-000000000003', repeat('d',64), 'Ada', null, 'Missing email', 'Subject')$$, '23502', null, 'invalid submission rolls back transaction');
select is((select count(*)::integer from portfolio_private.content_dedup where content_hash = repeat('d',64)), 0, 'failed insert also rolled back dedup reservation');
select is((select count(*)::integer from portfolio_private.submissions where idempotency_key = '20000000-0000-4000-8000-000000000003'), 0, 'failed insert did not reserve key');
select ok(not public.portfolio_moderate((select id from public.portfolio_notes where message = 'A note'), 'approved', '10000000-0000-4000-8000-000000000002'), 'moderation double-checks UUID allowlist');
select ok(public.portfolio_moderate((select id from public.portfolio_notes where message = 'A note'), 'approved', '10000000-0000-4000-8000-000000000001'), 'owner can approve');
select ok((select approved_at is not null and approved_by = '10000000-0000-4000-8000-000000000001' from public.portfolio_notes where message = 'A note'), 'approval timestamp and actor set by backend');
select ok(public.portfolio_moderate((select id from public.portfolio_notes where message = 'A note'), 'rejected', '10000000-0000-4000-8000-000000000001'), 'owner can unpublish');
select ok((select approved_at is null and approved_by is null from public.portfolio_notes where message = 'A note'), 'rejected note loses publication metadata');

select ok(public.portfolio_consume_rate(repeat('e',64)), 'first rate token accepted');
do $$ begin for i in 1..9 loop perform public.portfolio_consume_rate(repeat('e',64)); end loop; end $$;
select ok(not public.portfolio_consume_rate(repeat('e',64)), 'eleventh attempt denied atomically');
select is((select hits from portfolio_private.rate_limits where ip_hash = repeat('e',64)), 11, 'counter is capped');

create temporary table claimed as select * from public.portfolio_claim_notifications(null, 10);
select is((select count(*)::integer from claimed where payload->>'message' = 'A note'), 1, 'worker claims saved note');
select is((select count(*)::integer from public.portfolio_claim_notifications(null, 10) where payload->>'message' = 'A note'), 0, 'active lease cannot be claimed twice');
select ok(not public.portfolio_finish_notification((select id from claimed where payload->>'message' = 'A note'), gen_random_uuid(), true), 'wrong lease token cannot finish');
select ok(public.portfolio_finish_notification((select id from claimed where payload->>'message' = 'A note'), (select lease_token from claimed where payload->>'message' = 'A note'), false), 'provider failure recorded');
select ok((select status = 'failed' and attempts = 1 and next_attempt_at > now() from portfolio_private.notification_outbox where payload->>'message' = 'A note'), 'failed email has bounded backoff');
update portfolio_private.notification_outbox set first_attempt_at = now() - interval '24 hours', next_attempt_at = now() where payload->>'message' = 'A note';
select is((select count(*)::integer from public.portfolio_claim_notifications(null, 10) where payload->>'message' = 'A note'), 0, 'outside provider retention: do not resend');
select is((select status from portfolio_private.notification_outbox where payload->>'message' = 'A note'), 'expired', 'uncertain old sends remain visible as failures');
reset role;
select * from finish();
rollback;
