import { backendConfigured, publicKey, supabaseUrl } from './supabase.js';

const genericError = 'Something went wrong. Please try again.';
// Only exact, known validation messages may pass through. All other error text
// comes from this client-side mapping, never from an arbitrary server response.
const validationErrors = new Set([
  'Please enter a valid email address.',
  'Please provide a valid request ID.',
  'Unable to accept this submission.',
  ...Object.entries({ name: [100], email: [254], subject: [150], message: [500, 5000] }).flatMap(([field, limits]) => [
    `Please enter a valid ${field}.`,
    ...limits.map((limit) => `Please enter a valid ${field} (maximum ${limit} characters).`),
  ]),
]);
function safeErrorMessage(status, serverMessage, authenticated) {
  switch (status) {
    case 400: return validationErrors.has(serverMessage) ? serverMessage : 'Please check your submission and try again.';
    case 401: return 'Your session has expired. Please sign in again.';
    case 403:
      if (authenticated) return 'You do not have access to this action.';
      if (serverMessage === 'This origin is not allowed.') return 'This request cannot be accepted from this site. Please use the portfolio website.';
      if (serverMessage === 'Unable to verify this request. Please try again later.') return 'This request could not be verified. Please try again later.';
      return 'Verification failed. Please complete the security check again. If it still fails, try again later.';
    case 409: return 'This submission was already received, or its request ID was reused. Please wait before trying again.';
    case 429: return 'Too many submissions. Please try again in ten minutes.';
    case 503: return 'Verification is temporarily unavailable. Please try again later.';
    default: return genericError;
  }
}
export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'ApiError'; this.status = status; }
}
export async function portfolioApi(action, payload = {}, { token, signal } = {}) {
  if (!backendConfigured) throw new ApiError('The connection is not configured yet. Please try again later.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 20000);
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/portfolio-api`, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', apikey: publicKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ ...payload, action }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(safeErrorMessage(response.status, result?.error, Boolean(token)), response.status);
    }
    if (!result || typeof result !== 'object' || result.error) throw new ApiError(genericError);
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(genericError);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}
