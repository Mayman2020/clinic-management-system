import { environment } from '../../../environments/environment';

type RuntimeWindow = Window & { __CM_FILE_URL__?: string };
const ACCESS_TOKEN_KEY = 'cm_access_token';

export function getRuntimeFileBaseUrl(): string {
  const runtimeFileUrl = typeof window !== 'undefined' ? (window as RuntimeWindow).__CM_FILE_URL__ : undefined;
  return (runtimeFileUrl?.trim() || environment.fileUrl).replace(/\/+$/, '');
}

function appendToken(url: string): string {
  const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  const clean = url.replace(/([?&])tk=[^&]*/g, '').replace(/[?&]$/, '');
  if (!token) return clean;
  return `${clean}${clean.includes('?') ? '&' : '?'}tk=${encodeURIComponent(token)}`;
}

export function normalizeFileUrl(value: string): string {
  const raw = value.trim();
  if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return value;
  const fileBaseUrl = getRuntimeFileBaseUrl();
  if (/^https?:\/\//i.test(raw)) return raw.startsWith(fileBaseUrl) ? appendToken(raw) : raw;
  if (raw.startsWith('/files/')) return appendToken(`${fileBaseUrl}/${raw.slice('/files/'.length)}`);
  return raw;
}

export function normalizeFileUrlsInValue<T>(value: T): T {
  if (typeof value === 'string') return normalizeFileUrl(value) as T;
  if (Array.isArray(value)) return value.map((item) => normalizeFileUrlsInValue(item)) as T;
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(source)) {
      const normalized = normalizeFileUrlsInValue(item);
      next[key] = normalized;
      if (normalized !== item) changed = true;
    }
    return (changed ? next : value) as T;
  }
  return value;
}
