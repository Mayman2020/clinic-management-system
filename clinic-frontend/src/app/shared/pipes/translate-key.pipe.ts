import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Pipe({ name: 'tk', standalone: true, pure: false })
export class TranslateKeyPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
  transform(value: unknown, prefix: string): string {
    if (value == null || value === '') return '';
    const key = prefix + '.' + String(value);
    const t = this.translate.instant(key);
    return t !== key ? t : String(value);
  }
}
