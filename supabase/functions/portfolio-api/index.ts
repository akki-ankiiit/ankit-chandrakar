import { createHandler, loadConfig } from "./core.ts";
import { createRepository } from "./repository.ts";

// Fail closed on missing/invalid server configuration, while still returning a
// safe JSON error rather than runtime configuration or dependency details.
let handler: (request: Request) => Promise<Response>;
try {
  const config = loadConfig((name) => Deno.env.get(name));
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Missing Supabase configuration");
  handler = createHandler(createRepository(url, serviceKey), config);
} catch {
  handler = () => Promise.resolve(new Response(JSON.stringify({ error: "This service is temporarily unavailable. Please try again later." }), {
    status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  }));
}
Deno.serve(handler);
