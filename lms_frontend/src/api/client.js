/**
 * Lightweight API client for the LMS backend.
 *
 * Uses fetch and an env-driven base URL.
 * In CRA, environment variables must be prefixed with REACT_APP_.
 */

const DEFAULT_BASE_URL = 'http://localhost:4000';

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL (CRA: REACT_APP_API_BASE_URL).
 */
export function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function buildUrl(path) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function parseJsonOrText(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  return text ? { message: text } : {};
}

/**
 * PUBLIC_INTERFACE
 * Performs a JSON request against the backend.
 *
 * - Adds Authorization: Bearer <token> if provided.
 * - Uses credentials: 'include' for future compatibility with cookie-based auth.
 */
export async function apiRequest(path, { method = 'GET', token, body, headers } = {}) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await parseJsonOrText(res);
  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
