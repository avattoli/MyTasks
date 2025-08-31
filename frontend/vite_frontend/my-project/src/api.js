// Centralized API base + fetch helper
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_URL = RAW_API_URL.replace(/\/+$/, ''); // trim trailing slashes

export function apiUrl(path = '') {
  if (!path) return API_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  const opts = { credentials: options.credentials ?? 'include', ...options };
  return fetch(url, opts);
}
