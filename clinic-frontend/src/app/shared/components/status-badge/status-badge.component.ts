import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass, TranslateModule],
  template: `
    <span class="status-badge" [ngClass]="statusClass">
      {{ labelKey ? (labelKey | translate) : label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-badge.confirmed, .status-badge.completed, .status-badge.paid {
      background: var(--ok-bg);
      color: var(--ok);
    }
    .status-badge.pending, .status-badge.waiting, .status-badge.scheduled {
      background: var(--warn-bg);
      color: var(--warn);
    }
    .status-badge.cancelled, .status-badge.overdue {
      background: var(--bad-bg);
      color: var(--bad);
    }
    .status-badge.in-progress, .status-badge.active {
      background: var(--info-bg);
      color: var(--info);
    }
    .status-badge.default {
      background: var(--paper-2);
      color: var(--ink-600);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';
  @Input() labelKey = '';

  get statusClass(): string {
    const s = (this.status || this.label || '').toUpperCase().replace(/[_\s]/g, '-');
    const map: Record<string, string> = {
      'CONFIRMED': 'confirmed', 'COMPLETED': 'completed', 'PAID': 'paid',
      'PENDING': 'pending', 'WAITING': 'waiting', 'SCHEDULED': 'scheduled',
      'CANCELLED': 'cancelled', 'OVERDUE': 'overdue',
      'IN-PROGRESS': 'in-progress', 'IN_PROGRESS': 'in-progress', 'ACTIVE': 'active'
    };
    return map[s] || map[s.replace(/-/g, '_')] || 'default';
  }
}
