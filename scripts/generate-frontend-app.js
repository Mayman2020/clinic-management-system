/**
 * Generates clinic-frontend app source files (core, layout, features, services).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let fileCount = 0;

function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  fileCount++;
}

// --- app-constants ---
write('clinic-frontend/src/app/core/constants/app-constants.ts', `import { environment } from '../../../environments/environment';
import { getRuntimeFileBaseUrl } from '../utils/file-url-utils';

type RuntimeWindow = Window & { __CM_API_URL__?: string };

function getRuntimeApiBaseUrl(): string {
  const runtimeApiUrl = typeof window !== 'undefined' ? (window as RuntimeWindow).__CM_API_URL__ : undefined;
  return runtimeApiUrl?.trim() || environment.apiUrl;
}

export const HTTP_HEADERS = { ACTIVE_ROLE: 'X-Active-Role' } as const;

export const AppConstants = {
  PERSISTED_KEYS: {
    ACCESS_TOKEN: 'cm_access_token',
    REFRESH_TOKEN: 'cm_refresh_token',
    CURRENT_USER: 'cm_current_user',
  },
  API: {
    baseURL: getRuntimeApiBaseUrl(),
    fileBaseURL: getRuntimeFileBaseUrl(),
    FILES_UPLOAD: '/files/upload',
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_REFRESH: '/auth/refresh',
    USERS: '/users',
    USER_BY_ID: (id: number) => \`/users/\${id}\`,
    USERS_ME: '/users/me',
    USERS_ME_CHANGE_PASSWORD: '/users/me/change-password',
    USERS_TOGGLE_ACTIVE: (id: number) => \`/users/\${id}/toggle-active\`,
    USERS_ROLE: (id: number) => \`/users/\${id}/role\`,
    ROLE_PERMISSIONS_ME: '/role-permissions/me',
    ROLE_PERMISSIONS: '/role-permissions',
    ROLE_PERMISSIONS_BY_ROLE: (role: string) => \`/role-permissions/\${role}\`,
    SCREEN_SETTINGS: '/screen-settings',
    SCREEN_SETTING_BY_KEY: (screenKey: string) => \`/screen-settings/\${screenKey}\`,
    PATIENTS: '/patients',
    PATIENT_BY_ID: (id: number) => \`/patients/\${id}\`,
    PATIENT_SEARCH: '/patients/search',
    PATIENT_DOCUMENTS: (id: number) => \`/patients/\${id}/documents\`,
    DOCTORS: '/doctors',
    DOCTOR_BY_ID: (id: number) => \`/doctors/\${id}\`,
    DOCTOR_SCHEDULES: (id: number) => \`/doctors/\${id}/schedules\`,
    DOCTOR_SCHEDULE_BY_ID: (doctorId: number, scheduleId: number) => \`/doctors/\${doctorId}/schedules/\${scheduleId}\`,
    APPOINTMENTS: '/appointments',
    APPOINTMENT_BY_ID: (id: number) => \`/appointments/\${id}\`,
    APPOINTMENTS_BOOK: '/appointments/book',
    APPOINTMENT_STATUS: (id: number) => \`/appointments/\${id}/status\`,
    APPOINTMENTS_CALENDAR: '/appointments/calendar',
    APPOINTMENTS_BY_PATIENT: (patientId: number) => \`/appointments/patient/\${patientId}\`,
    APPOINTMENTS_BY_DOCTOR: (doctorId: number) => \`/appointments/doctor/\${doctorId}\`,
    QUEUE: '/queue',
    QUEUE_TODAY: '/queue/today',
    QUEUE_TOKENS: '/queue/tokens',
    QUEUE_TOKEN_BY_ID: (id: number) => \`/queue/tokens/\${id}\`,
    QUEUE_CALL_NEXT: '/queue/call-next',
    QUEUE_TV_DISPLAY: '/queue/tv-display',
    QUEUE_TOKEN_STATUS: (id: number) => \`/queue/tokens/\${id}/status\`,
    CONSULTATIONS: '/consultations',
    CONSULTATION_BY_ID: (id: number) => \`/consultations/\${id}\`,
    CONSULTATIONS_BY_APPOINTMENT: (appointmentId: number) => \`/consultations/appointment/\${appointmentId}\`,
    PRESCRIPTIONS: '/prescriptions',
    PRESCRIPTION_BY_ID: (id: number) => \`/prescriptions/\${id}\`,
    PRESCRIPTION_PRINT: (id: number) => \`/prescriptions/\${id}/print\`,
    PRESCRIPTION_ITEMS: (id: number) => \`/prescriptions/\${id}/items\`,
    LAB_REQUESTS: '/lab/requests',
    LAB_REQUEST_BY_ID: (id: number) => \`/lab/requests/\${id}\`,
    LAB_REQUEST_STATUS: (id: number) => \`/lab/requests/\${id}/status\`,
    RADIOLOGY_REQUESTS: '/radiology/requests',
    RADIOLOGY_REQUEST_BY_ID: (id: number) => \`/radiology/requests/\${id}\`,
    RADIOLOGY_REQUEST_STATUS: (id: number) => \`/radiology/requests/\${id}/status\`,
    INVOICES: '/billing/invoices',
    INVOICE_BY_ID: (id: number) => \`/billing/invoices/\${id}\`,
    INVOICE_ITEMS: (id: number) => \`/billing/invoices/\${id}/items\`,
    PAYMENTS: '/billing/payments',
    PAYMENT_BY_ID: (id: number) => \`/billing/payments/\${id}\`,
    PAYMENTS_BY_INVOICE: (invoiceId: number) => \`/billing/invoices/\${invoiceId}/payments\`,
    INSURANCE_PROVIDERS: '/insurance/providers',
    INSURANCE_PROVIDER_BY_ID: (id: number) => \`/insurance/providers/\${id}\`,
    INSURANCE_CLAIMS: '/insurance/claims',
    INSURANCE_CLAIM_BY_ID: (id: number) => \`/insurance/claims/\${id}\`,
    INSURANCE_CLAIM_STATUS: (id: number) => \`/insurance/claims/\${id}/status\`,
    DASHBOARD_STATS: '/dashboard/stats',
    DASHBOARD_REVENUE: '/dashboard/revenue',
    DASHBOARD_APPOINTMENTS: '/dashboard/appointments',
    DASHBOARD_QUEUE_SUMMARY: '/dashboard/queue-summary',
    REPORTS_APPOINTMENTS: '/reports/appointments',
    REPORTS_REVENUE: '/reports/revenue',
    REPORTS_PATIENTS: '/reports/patients',
    REPORTS_DOCTORS: '/reports/doctors',
    SETTINGS: '/settings',
    SETTINGS_BY_KEY: (key: string) => \`/settings/\${key}\`,
    AUDIT_LOGS: '/audit-logs',
  },
} as const;

export function shouldSkipGlobalLoaderForUpload(url: string, method: string): boolean {
  const u = url ?? '';
  const m = (method ?? '').toUpperCase();
  if (u.includes(AppConstants.API.FILES_UPLOAD)) return true;
  return false;
}
`);

// user model
write('clinic-frontend/src/app/core/models/user.model.ts', `export type UserRole =
  | 'ADMIN'
  | 'RECEPTIONIST'
  | 'DOCTOR'
  | 'NURSE'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGY_STAFF'
  | 'CASHIER';

export const USER_ROLE_VALUES: readonly UserRole[] = [
  'ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGY_STAFF', 'CASHIER'
];

const USER_ROLE_CODE_SET = new Set<string>(USER_ROLE_VALUES as readonly string[]);

export function isUserRoleCode(code: string | null | undefined): code is UserRole {
  return !!code && USER_ROLE_CODE_SET.has(code);
}

export type PermissionAction =
  | 'enabled' | 'menu' | 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

export type ModulePermissions = Record<PermissionAction, boolean>;
export type PermissionMap = Record<string, ModulePermissions>;

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  phone?: string;
  profileImageUrl?: string;
  role: UserRole;
  extraRoles?: UserRole[];
  doctorId?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  permissions?: PermissionMap;
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  phone?: string;
  profileImageUrl?: string;
  role: UserRole;
  activeRole?: UserRole;
  extraRoles?: UserRole[];
  doctorId?: number;
  initials: string;
  permissions?: PermissionMap;
  mustChangePassword?: boolean;
}

export interface LoginRequest { email: string; username?: string; password: string; }

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number; email: string; username: string; fullName: string;
    fullNameAr?: string; fullNameEn?: string; profileImageUrl?: string;
    role: UserRole; extraRoles?: UserRole[]; doctorId?: number;
    permissions?: PermissionMap; mustChangePassword?: boolean;
  };
}
`);

write('clinic-frontend/src/app/core/models/api-response.model.ts', `export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
`);

// utils
write('clinic-frontend/src/app/core/utils/jwt-utils.ts', `export class JwtUtils {
  static decode(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch { return null; }
  }
  static isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded || typeof decoded['exp'] !== 'number') return true;
    return (decoded['exp'] as number) * 1000 < Date.now();
  }
}
`);

write('clinic-frontend/src/app/core/utils/file-url-utils.ts', `import { environment } from '../../../environments/environment';

type RuntimeWindow = Window & { __CM_FILE_URL__?: string };
const ACCESS_TOKEN_KEY = 'cm_access_token';

export function getRuntimeFileBaseUrl(): string {
  const runtimeFileUrl = typeof window !== 'undefined' ? (window as RuntimeWindow).__CM_FILE_URL__ : undefined;
  return (runtimeFileUrl?.trim() || environment.fileUrl).replace(/\\/+$/, '');
}

function appendToken(url: string): string {
  const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  const clean = url.replace(/([?&])tk=[^&]*/g, '').replace(/[?&]$/, '');
  if (!token) return clean;
  return \`\${clean}\${clean.includes('?') ? '&' : '?'}tk=\${encodeURIComponent(token)}\`;
}

export function normalizeFileUrl(value: string): string {
  const raw = value.trim();
  if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return value;
  const fileBaseUrl = getRuntimeFileBaseUrl();
  if (/^https?:\\/\\//i.test(raw)) return raw.startsWith(fileBaseUrl) ? appendToken(raw) : raw;
  if (raw.startsWith('/files/')) return appendToken(\`\${fileBaseUrl}/\${raw.slice('/files/'.length)}\`);
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
`);

write('clinic-frontend/src/app/core/utils/user-message.util.ts', `import { TranslateService } from '@ngx-translate/core';

export function resolveUserMessage(message: string, translate: TranslateService): string {
  const key = (message ?? '').trim();
  if (key && /^[A-Z0-9_.-]+$/.test(key)) {
    const t = translate.instant(key);
    if (t && t !== key) return t;
  }
  return message || translate.instant('ERRORS.GENERIC');
}
`);

write('clinic-frontend/src/app/core/i18n/locale-format.ts', `export const LATIN_NUMBER_LOCALE = 'en-US';
export const ARABIC_LATIN_DIGITS_LANG = 'ar-u-nu-latn';

export function toLatinDigits(text: string | number | null | undefined): string {
  return String(text ?? '')
    .replace(/[\\u0660-\\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\\u06F0-\\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

export function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return toLatinDigits('0');
  return toLatinDigits(new Intl.NumberFormat(LATIN_NUMBER_LOCALE, options).format(n));
}

export function formatCurrency(value: number | null | undefined, currency = 'SAR', options?: Intl.NumberFormatOptions): string {
  const n = Number(value);
  const fmt = new Intl.NumberFormat(LATIN_NUMBER_LOCALE, { style: 'currency', currency, maximumFractionDigits: 0, ...options });
  return toLatinDigits(fmt.format(Number.isFinite(n) ? n : 0));
}

export function formatDateTime(value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions, lang: 'ar' | 'en' = 'en'): string {
  if (value == null || value === '') return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const locale = lang === 'ar' ? ARABIC_LATIN_DIGITS_LANG : 'en-GB';
  return toLatinDigits(new Intl.DateTimeFormat(locale, options).format(date));
}
`);

write('clinic-frontend/src/app/core/i18n/i18n.service.ts', `import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ARABIC_LATIN_DIGITS_LANG, formatCurrency, formatDateTime, formatNumber, toLatinDigits } from './locale-format';

export type LangCode = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LanguageOption {
  code: LangCode; label: string; nativeLabel: string; dir: Direction; flagUrl: string;
}

const STORAGE_KEY = 'cm_lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages: LanguageOption[] = [
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', flagUrl: 'assets/flags/sa.svg' },
    { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', flagUrl: 'assets/flags/gb.svg' }
  ];

  constructor(private readonly translate: TranslateService, private readonly overlayContainer: OverlayContainer) {
    const saved = this.readSavedLanguage();
    this.translate.addLangs(['ar', 'en']);
    this.translate.setDefaultLang('ar');
    this.setLang(saved).subscribe({ error: () => {} });
  }

  get currentLang(): LangCode { return (this.translate.currentLang as LangCode) || 'ar'; }
  get currentDirection(): Direction { return this.languages.find((l) => l.code === this.currentLang)?.dir ?? 'rtl'; }
  get isRtl(): boolean { return this.currentDirection === 'rtl'; }

  setLang(code: LangCode): Observable<unknown> {
    const lang = this.languages.find((l) => l.code === code) ? code : 'ar';
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    this.applyLang(lang);
    return this.translate.use(lang).pipe(tap(() => {
      const title = this.translate.instant('APP.TAGLINE');
      if (title && title !== 'APP.TAGLINE') document.title = title;
    }));
  }

  instant(key: string, params?: Record<string, unknown>): string { return this.translate.instant(key, params); }
  formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions): string { return formatNumber(value, options); }
  formatCurrency(value: number | null | undefined, currency = 'SAR', options?: Intl.NumberFormatOptions): string { return formatCurrency(value, currency, options); }
  formatDateTime(value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string { return formatDateTime(value, options, this.currentLang); }
  toLatinDigits(text: string | number | null | undefined): string { return toLatinDigits(text); }

  private applyLang(code: LangCode): void {
    const lang = this.languages.find((l) => l.code === code) ?? this.languages[0];
    const htmlLang = code === 'ar' ? ARABIC_LATIN_DIGITS_LANG : 'en';
    document.documentElement.setAttribute('dir', lang.dir);
    document.documentElement.setAttribute('lang', htmlLang);
    document.body.setAttribute('dir', lang.dir);
    try { this.overlayContainer.getContainerElement().setAttribute('dir', lang.dir); } catch { /* ignore */ }
  }

  private readSavedLanguage(): LangCode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (saved === 'ar' || saved === 'en') return saved;
    } catch { /* ignore */ }
    return 'ar';
  }
}
`);

write('clinic-frontend/src/app/core/adapters/date-format.adapter.ts', `import { NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';

export class DateFormatAdapter extends NativeDateAdapter {
  override parse(value: string | null, _parseFormat: unknown): Date | null {
    if (!value) return null;
    const match = /^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})$/.exec(String(value).trim());
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime()) && d.getDate() === day) return d;
    }
    return super.parse(value, _parseFormat);
  }
  override format(date: Date, displayFormat: string): string {
    if (!this.isValid(date)) throw Error('DateFormatAdapter: Cannot format invalid date.');
    return formatDate(date, displayFormat, this.locale as string);
  }
}
`);

module.exports = { write, getFileCount: () => fileCount, setFileCount: (n) => { fileCount = n; }, incFileCount: () => ++fileCount };
