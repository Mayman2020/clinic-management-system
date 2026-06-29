import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, MatButtonModule, TranslateModule],
  template: `
    <div class="empty-state">
      <img *ngIf="imageSrc" [src]="imageSrc" [alt]="titleKey | translate" class="empty-illustration" />
      <span *ngIf="!imageSrc && icon" class="material-icons empty-icon">{{ icon }}</span>
      <h3>{{ titleKey | translate }}</h3>
      <p *ngIf="messageKey">{{ messageKey | translate }}</p>
      <button *ngIf="actionKey" mat-flat-button color="primary" (click)="actionClick.emit()">
        {{ actionKey | translate }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-illustration {
      width: min(240px, 80%);
      height: auto;
      margin-bottom: 8px;
    }
    .empty-icon {
      font-size: 56px;
      color: var(--blue-300);
      opacity: 0.6;
    }
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--ink-800);
    }
    p {
      margin: 0;
      max-width: 360px;
      font-size: 0.875rem;
      color: var(--ink-500);
      line-height: 1.5;
    }
  `]
})
export class EmptyStateComponent {
  @Input() imageSrc = '';
  @Input() icon = 'inbox';
  @Input() titleKey = 'COMMON.NO_DATA';
  @Input() messageKey = '';
  @Input() actionKey = '';
  @Output() actionClick = new EventEmitter<void>();
}
