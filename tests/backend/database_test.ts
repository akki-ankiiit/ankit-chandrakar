// A real PostgreSQL WASM engine verifies the migration without Docker or any
// hosted connection. Supabase-specific auth schema/roles are minimal fixtures.
// The complementary pgTAP suite runs against a full local Supabase database.
// deno-lint-ignore no-import-prefix
import { PGlite } from "npm:@electric-sql/pglite@0.3.14";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

Deno.test("database: migration, privileges, atomic dedup, moderation and outbox leases", async () => {
  const db = new PGlite();
  const scalar = async (sql: string, params: unknown[] = []) => {
    const result = await db.query<{ value: unknown }>(sql, params);
    return result.rows[0]?.value;
  };
  const denied = async (role: string, sql: string) => {
    await db.exec(`set role ${role}`);
    let code: unknown;
    try { await db.exec(sql); } catch (error) { code = (error as { code: string }).code; }
    finally { await db.exec("reset role"); }
    assert(code === "42501", `${role} must be denied: ${sql} (got ${code})`);
  };
  const key = "20000000-0000-4000-8000-000000000001";
  const admin = "10000000-0000-4000-8000-000000000001";
  const hash = "a".repeat(64);
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      grant usage on schema public to anon, authenticated, service_role;
      create schema auth;
      create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, deleted_at timestamptz);
      insert into auth.users values ('${admin}', 'chandrakarankit014@gmail.com', now(), null);
    `);
    await db.exec(await Deno.readTextFile(new URL("../../supabase/migrations/202611010001_portfolio.sql", import.meta.url)));
    await db.exec(await Deno.readTextFile(new URL("../../supabase/bootstrap-owner.sql", import.meta.url)));
    assert(await scalar("select public.portfolio_is_admin($1) as value", [admin]), "bootstrap provisions confirmed owner UUID");
    for (const role of ["anon", "authenticated"]) {
      for (const sql of [
        "select email from public.portfolio_notes",
        "select * from public.portfolio_messages",
        "insert into public.portfolio_notes(name,message) values ('Bot','Bypass')",
        "update public.portfolio_notes set status = 'approved'",
        "update public.portfolio_messages set status = 'archived'",
        "delete from public.portfolio_notes",
        "select * from portfolio_private.portfolio_admins",
        "select public.portfolio_admin_counts()",
        `select public.portfolio_submit('note','${key}','${hash}','Bot',null,'Bypass')`,
      ]) await denied(role, sql);
    }
    const secured = await db.query<{ relname: string; relrowsecurity: boolean }>(`
      select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on c.relnamespace=n.oid
      where (n.nspname='portfolio_private' and c.relkind='r') or (n.nspname='public' and c.relname in ('portfolio_notes','portfolio_messages'))
    `);
    assert(secured.rows.length === 7 && secured.rows.every((r) => r.relrowsecurity), "all 7 tables enable RLS");
    const funcs = await db.query<{ proname: string; pinned: boolean; anon: boolean; authenticated: boolean }>(`
      select p.proname, p.proconfig @> array['search_path=pg_catalog'] as pinned,
        has_function_privilege('anon',p.oid,'EXECUTE') as anon,
        has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'portfolio_%'
    `);
    assert(funcs.rows.length === 8 && funcs.rows.every((f) => f.pinned && !f.anon && !f.authenticated), "all privileged functions pin search_path and deny clients");
    assert(await scalar(`select indexdef like '%(status, created_at DESC, id DESC)' as value from pg_indexes
      where schemaname='public' and tablename='portfolio_messages' and indexname='portfolio_messages_status_order'`), "contact status and creation ordering has composite index");
    // An independent source default proves the outbox uses INSERT RETURNING,
    // rather than inventing a timestamp at notification creation/delivery time.
    await db.exec("alter table public.portfolio_notes alter created_at set default '2026-10-01T01:02:03Z'::timestamptz");
    await db.exec("set role service_role");
    for (const table of ["portfolio_notes", "portfolio_messages"]) {
      const base: Record<string, string> = { name: "Ada", email: "ada@example.com", message: "Hello", ...(table === "portfolio_messages" ? { subject: "Project" } : {}) };
      const fields = Object.keys(base);
      for (const field of ["name", "message", ...(table === "portfolio_messages" ? ["subject"] : [])]) {
        for (const whitespace of ["\t", "\r\n", "\t \n", "\u00a0", "\u2003\ufeff"]) {
          const changed = { ...base, [field]: whitespace };
          let code: unknown;
          try { await db.query(`insert into public.${table}(${fields.join(",")}) values (${fields.map((_, i) => `$${i + 1}`).join(",")})`, fields.map((f) => changed[f])); }
          catch (error) { code = (error as { code: string }).code; }
          assert(code === "23514", `${table}.${field} rejects whitespace-only SQL inserts`);
        }
      }
      for (const field of ["name", "email", ...(table === "portfolio_messages" ? ["subject"] : [])]) {
        for (const control of ["\t", "\n", "\r", "\x01", "\x1f", "\x7f"]) {
          const changed = { ...base, [field]: `${base[field]}${control}X` };
          let code: unknown;
          try { await db.query(`insert into public.${table}(${fields.join(",")}) values (${fields.map((_, i) => `$${i + 1}`).join(",")})`, fields.map((f) => changed[f])); }
          catch (error) { code = (error as { code: string }).code; }
          assert(code === "23514", `${table}.${field} rejects embedded ASCII control ${control.charCodeAt(0)}`);
        }
      }
      for (const control of ["\x01", "\x0b", "\x0c", "\x1f", "\x7f"]) {
        const changed: Record<string, string> = { ...base, message: `Hello${control}world` };
        let code: unknown;
        try { await db.query(`insert into public.${table}(${fields.join(",")}) values (${fields.map((_, i) => `$${i + 1}`).join(",")})`, fields.map((f) => changed[f])); }
        catch (error) { code = (error as { code: string }).code; }
        assert(code === "23514", `${table}.message rejects non-whitespace ASCII controls`);
      }
      // Valid multiline/tab messages remain allowed by the database boundary.
      const valid: Record<string, string> = { ...base, message: "Hello\tworld\r\nSecond line" };
      const inserted = await db.query<{ id: string }>(`insert into public.${table}(${fields.join(",")}) values (${fields.map((_, i) => `$${i + 1}`).join(",")}) returning id`, fields.map((f) => valid[f]));
      await db.query(`delete from public.${table} where id=$1`, [inserted.rows[0].id]);
    }
    const submit = (id: string, contentHash: string, message = "Hello") => scalar(
      "select public.portfolio_submit('note',$1,$2,'Ada','ada@example.com',$3)->>'outcome' as value", [id, contentHash, message],
    );
    assert(await submit(key, hash) === "created", "valid submission persisted");
    assert(await submit(key, hash) === "duplicate", "same key/content idempotent");
    assert(await submit("20000000-0000-4000-8000-000000000002", hash) === "conflict", "different key same content rejected");
    assert(await submit(key, "b".repeat(64), "Changed") === "conflict", "key reuse for different content rejected");
    assert(await scalar("select count(*)::int as value from public.portfolio_notes") === 1, "exactly one note");
    assert(await scalar("select count(*)::int as value from portfolio_private.notification_outbox") === 1, "exactly one atomic notification");
    assert(await scalar(`select (o.payload->>'created_at')::timestamptz=n.created_at and o.payload->>'status'=n.status
      and n.created_at='2026-10-01T01:02:03Z'::timestamptz and n.status='pending' as value
      from portfolio_private.notification_outbox o join public.portfolio_notes n on n.id=(o.payload->>'id')::uuid`), "note snapshot contains actual source timestamp and initial pending status");
    const failureCount = async () => (await scalar("select public.portfolio_admin_counts() as value") as { notificationFailures: number }).notificationFailures;
    assert(await failureCount() === 0, "fresh pending notification is not yet a failure");
    await db.exec("update portfolio_private.notification_outbox set created_at=now()-interval '91 seconds'");
    assert(await failureCount() === 1, "overdue unclaimed pending notification is visible as a failure");
    await db.exec("update portfolio_private.notification_outbox set created_at=now()-interval '89 seconds'");
    assert(await failureCount() === 0, "pending notification within grace period is not counted");
    let failure: unknown;
    try {
      await scalar("select public.portfolio_submit('message',$1,$2,'Ada',null,'Bad','Subject') as value", ["20000000-0000-4000-8000-000000000003", "c".repeat(64)]);
    } catch (error) { failure = (error as { code: string }).code; }
    assert(failure === "23502", "missing contact email fails database validation");
    assert(await scalar("select count(*)::int as value from portfolio_private.content_dedup where content_hash=$1", ["c".repeat(64)]) === 0, "failed submission rolls back dedup reservation");
    const noteId = await scalar("select id as value from public.portfolio_notes") as string;
    assert(await scalar("select public.portfolio_moderate($1,'approved',$2) as value", [noteId, "10000000-0000-4000-8000-000000000002"]) === false, "non-admin cannot moderate");
    assert(await scalar("select public.portfolio_moderate($1,'approved',$2) as value", [noteId, admin]), "admin approves");
    assert(await scalar("select approved_at is not null and approved_by=$1 as value from public.portfolio_notes", [admin]), "server publication actor/timestamp");
    await scalar("select public.portfolio_moderate($1,'rejected',$2) as value", [noteId, admin]);
    assert(await scalar("select approved_at is null and approved_by is null as value from public.portfolio_notes"), "rejection removes publication metadata");
    assert(await scalar("select payload->>'status'='pending' as value from portfolio_private.notification_outbox"), "snapshot retains initial status after moderation");
    for (let i = 1; i <= 11; i++) {
      assert(await scalar("select public.portfolio_consume_rate($1) as value", ["d".repeat(64)]) === (i <= 10), `rate attempt ${i}`);
    }
    await db.exec("update portfolio_private.rate_limits set expires_at=now()-interval '1 second'");
    assert(await scalar("select public.portfolio_consume_rate($1) as value", ["d".repeat(64)]), "expired rate window resets");
    const claim = await db.query<{ id: string; lease_token: string }>("select * from public.portfolio_claim_notifications(null,10)");
    assert(claim.rows.length === 1, "one worker claims notification");
    assert(await failureCount() === 0, "live processing lease is not a failure");
    assert((await db.query("select * from public.portfolio_claim_notifications(null,10)")).rows.length === 0, "second worker cannot claim active lease");
    const row = claim.rows[0];
    assert(await scalar("select public.portfolio_finish_notification($1,$2,true) as value", [row.id, key]) === false, "stale lease cannot finish");
    assert(await scalar("select public.portfolio_finish_notification($1,$2,false) as value", [row.id, row.lease_token]), "provider failure durable");
    assert(await scalar("select status='failed' and attempts=1 and next_attempt_at>now() as value from portfolio_private.notification_outbox"), "backoff after failed attempt");
    await db.exec("update portfolio_private.notification_outbox set first_attempt_at=now()-interval '24 hours',next_attempt_at=now()");
    assert((await db.query("select * from public.portfolio_claim_notifications(null,10)")).rows.length === 0, "do not retry outside provider key retention");
    assert(await scalar("select status as value from portfolio_private.notification_outbox") === "expired", "expired notification visible in dashboard");
    const counts = await scalar("select public.portfolio_admin_counts() as value") as { notificationFailures: number };
    assert(counts.notificationFailures === 1, "dashboard counts terminal notification failure");
    assert(await scalar("select public.portfolio_submit('message',$1,$2,'Ada','ada@example.com','A project','Hello')->>'outcome' as value", ["20000000-0000-4000-8000-000000000004", "f".repeat(64)]) === "created", "contact message persisted atomically");
    assert(await scalar("select status='unread' and subject='Hello' as value from public.portfolio_messages"), "contact starts unread with subject");
    assert(await scalar(`select (o.payload->>'created_at')::timestamptz=m.created_at and o.payload->>'status'=m.status and m.status='unread' as value
      from portfolio_private.notification_outbox o join public.portfolio_messages m on m.id=(o.payload->>'id')::uuid where o.kind='message'`), "contact snapshot contains actual source timestamp and initial unread status");
    const firstLease = (await db.query<{ id: string; lease_token: string }>("select * from public.portfolio_claim_notifications(null,10)")).rows[0];
    await db.exec("update portfolio_private.notification_outbox set lease_until=now()-interval '1 second' where status='processing'");
    assert(await failureCount() === 2, "abandoned processing lease counted alongside existing expired failure");
    const secondLease = (await db.query<{ id: string; lease_token: string }>("select * from public.portfolio_claim_notifications(null,10)")).rows[0];
    assert(firstLease.lease_token !== secondLease.lease_token, "abandoned lease replaced with fresh token");
    assert(await scalar("select public.portfolio_finish_notification($1,$2,true) as value", [firstLease.id, firstLease.lease_token]) === false, "old worker cannot finish a reclaimed notification");
    assert(await scalar("select public.portfolio_finish_notification($1,$2,true) as value", [secondLease.id, secondLease.lease_token]), "current worker records successful send");
    assert(await scalar("select status='sent' and sent_at is not null as value from portfolio_private.notification_outbox where kind='message'"), "success is durable");
    assert((await db.query("select * from public.portfolio_claim_notifications(null,10)")).rows.length === 0, "sent notifications are never reclaimed");
    await db.exec("update portfolio_private.notification_outbox set created_at=now()-interval '31 days'");
    await db.exec("select public.portfolio_cleanup()");
    assert(await scalar("select count(*)::int as value from portfolio_private.notification_outbox") === 0, "outbox PII retention bounded");
  } finally { await db.close(); }
});
