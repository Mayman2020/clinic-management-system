import { TranslateService } from '@ngx-translate/core';

export function resolveUserMessage(message: string, translate: TranslateService): string {
  const key = (message ?? '').trim();
  if (key && /^[A-Z0-9_.-]+$/.test(key)) {
    const t = translate.instant(key);
    if (t && t !== key) return t;
  }
  return message || translate.instant('ERRORS.GENERIC');
}
