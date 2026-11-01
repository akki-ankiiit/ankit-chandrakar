// Inline version pin keeps the deployed Edge bundle independent of app tooling.
// deno-lint-ignore no-import-prefix
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import type { Outbox, PublicNote, Repository, Submission } from "./core.ts";

export function createRepository(url: string, serviceKey: string): Repository {
  const db = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  async function rpc<T>(name: string, args = {}): Promise<T> {
    const { data, error } = await db.rpc(name, args);
    if (error) throw new Error("Database operation failed");
    return data as T;
  }
  return {
    async publicNotes(offset, limit) {
      const { data, error } = await db.from("portfolio_notes").select("id,name,message,approved_at")
        .eq("status", "approved").order("approved_at", { ascending: false }).order("id", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw new Error("Database operation failed");
      return data as PublicNote[];
    },
    async user(token) {
      const { data, error } = await db.auth.getUser(token);
      // Network/service failures are safe 500s, invalid/missing JWTs are 401s.
      if (error) {
        if (error.status && error.status >= 500) throw new Error("Authentication unavailable");
        return null;
      }
      return data.user?.id || null;
    },
    isAdmin: (id) => rpc<boolean>("portfolio_is_admin", { p_user_id: id }),
    consumeRate: (hash) => rpc<boolean>("portfolio_consume_rate", { p_ip_hash: hash }),
    submit: (value: Submission, hash) => rpc("portfolio_submit", {
      p_kind: value.kind, p_key: value.idempotencyKey, p_hash: hash,
      p_name: value.name, p_email: value.email, p_message: value.message, p_subject: value.subject,
    }),
    async adminRows(tab, offset, limit) {
      const notes = tab !== "messages";
      let query = db.from(notes ? "portfolio_notes" : "portfolio_messages")
        .select(notes ? "id,name,email,message,created_at,status,approved_at" : "id,name,email,subject,message,created_at,status");
      if (notes) query = query.eq("status", tab);
      const { data, error } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + limit - 1);
      if (error) throw new Error("Database operation failed");
      return data as unknown as Record<string, unknown>[];
    },
    counts: () => rpc("portfolio_admin_counts"),
    moderate: (id, status, admin) => rpc("portfolio_moderate", { p_id: id, p_status: status, p_admin: admin }),
    async deleteNote(id) {
      const { data, error } = await db.from("portfolio_notes").delete().eq("id", id).select("id");
      if (error) throw new Error("Database operation failed");
      return data.length > 0;
    },
    async updateMessage(id, status) {
      const { data, error } = await db.from("portfolio_messages").update({ status }).eq("id", id).select("id");
      if (error) throw new Error("Database operation failed");
      return data.length > 0;
    },
    claim: (id) => rpc<Outbox[]>("portfolio_claim_notifications", { p_id: id || null, p_limit: id ? 1 : 10 }),
    finish: (row, sent) => rpc<boolean>("portfolio_finish_notification", { p_id: row.id, p_lease: row.lease_token, p_sent: sent }),
  };
}
