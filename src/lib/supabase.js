import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
export const publicKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
function validUrl(value) {
  try {
    const url = new URL(value);
    return !url.username && !url.password && !url.search && !url.hash && url.pathname === '/' &&
      (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)));
  } catch { return false; }
}
function validKey(key) {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
  try {
    const parts = key.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return parts.length === 3 && payload.role === 'anon';
  } catch { return false; }
}
export const backendConfigured = validUrl(rawUrl) && validKey(publicKey);
export const supabaseUrl = backendConfigured ? rawUrl.replace(/\/$/, '') : '';
export const supabase = backendConfigured ? createClient(supabaseUrl, publicKey) : null;
export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || '';
export const submissionsConfigured = backendConfigured && Boolean(turnstileSiteKey);
