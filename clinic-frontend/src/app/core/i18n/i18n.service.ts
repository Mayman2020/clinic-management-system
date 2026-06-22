import { Injectable } from '@angular/core';
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
