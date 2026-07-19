import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-inline-state',
  standalone: true,
  imports: [NgIf, MatButtonModule, TranslateModule],
  template: `
    <div class="inline-state" [class.inline-state--error]="variant === 'error'">
      <span class="material-icons">{{ icon }}</span>
      <h4>{{ titleKey | translate }}</h4>
      <p *ngIf="messageKey">{{ messageKey | translate }}</p>
      <button *ngIf="actionLabelKey" mat-stroked-button type="button" (click)="action.emit()">{{ actionLabelKey | translate }}</button>
    </div>
  `,
  styles: [`
    .inline-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px; border-radius: 12px; background: rgba(15, 23, 42, 0.03); text-align: center; }
    .inline-state--error { background: rgba(220, 38, 38, 0.06); }
    .material-icons { font-size: 36px; color: var(--blue-400); }
    h4 { margin: 0; color: var(--ink-800); }
    p { margin: 0; color: var(--ink-500); }
  `]
})
export class InlineStateComponent {
  @Input() icon = 'info';
  @Input() titleKey = 'COMMON.NO_DATA';
  @Input() messageKey = '';
  @Input() actionLabelKey = '';
  @Input() variant: 'default' | 'error' = 'default';
  @Output() action = new EventEmitter<void>();
}
