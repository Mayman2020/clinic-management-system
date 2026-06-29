import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { DATE_DISPLAY_OPTIONS, DATE_TIME_DISPLAY_OPTIONS } from '../../core/i18n/locale-format';

@Pipe({ name: 'rmsDate', standalone: true, pure: false })
export class RmsDatePipe implements PipeTransform {
  constructor(
    private readonly i18n: I18nService,
    private readonly translate: TranslateService
  ) {}

  transform(
    value: Date | string | number | null | undefined,
    mode: 'date' | 'datetime' = 'datetime'
  ): string {
    this.translate.currentLang;
    const options = mode === 'date' ? DATE_DISPLAY_OPTIONS : DATE_TIME_DISPLAY_OPTIONS;
    return this.i18n.formatDateTime(value, options);
  }
}
