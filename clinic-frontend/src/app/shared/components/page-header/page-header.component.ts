import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-page-header', standalone: true, imports: [NgIf, TranslateModule],
  template: `<header class="app-page-header"><div class="page-heading"><p class="app-page-eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p><h1 class="app-page-title">{{ title }}</h1><p class="app-page-subtitle" *ngIf="subtitle">{{ subtitle }}</p></div><div class="page-actions"><ng-content></ng-content></div></header>`,
  styles: [`:host { display: block; } .page-heading { min-width: 0; } .page-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }`]
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
}
