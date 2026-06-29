import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rms-icon-btn',
  standalone: true,
  imports: [NgIf, RouterLink, MatTooltipModule, TranslateModule],
  template: `
    <a
      *ngIf="routerLink; else actionBtn"
      class="rms-icon-btn"
      [class.rms-icon-btn--primary]="variant === 'primary'"
      [class.rms-icon-btn--gold]="variant === 'gold'"
      [class.rms-icon-btn--warn]="variant === 'warn'"
      [routerLink]="routerLink"
      [attr.aria-label]="ariaLabel || (tooltipKey | translate)"
      [matTooltip]="tooltip || (tooltipKey | translate)"
      matTooltipPosition="below">
      <span class="material-icons">{{ icon }}</span>
    </a>
    <ng-template #actionBtn>
      <button
        type="button"
        class="rms-icon-btn"
        [class.rms-icon-btn--primary]="variant === 'primary'"
        [class.rms-icon-btn--gold]="variant === 'gold'"
        [class.rms-icon-btn--warn]="variant === 'warn'"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || (tooltipKey | translate)"
        [matTooltip]="tooltip || (tooltipKey | translate)"
        matTooltipPosition="below"
        (click)="clicked.emit($event)">
        <span class="material-icons">{{ icon }}</span>
      </button>
    </ng-template>
  `
})
export class RmsIconBtnComponent {
  @Input() icon = 'help';
  @Input() tooltip = '';
  @Input() tooltipKey = '';
  @Input() ariaLabel = '';
  @Input() variant: 'default' | 'primary' | 'gold' | 'warn' = 'default';
  @Input() disabled = false;
  @Input() routerLink: string | any[] | null = null;
  @Output() clicked = new EventEmitter<MouseEvent>();
}
