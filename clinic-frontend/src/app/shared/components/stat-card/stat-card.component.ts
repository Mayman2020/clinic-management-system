import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type StatCardVariant = 'blue' | 'green' | 'orange' | 'red' | 'purple';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf, MatIconModule],
  template: `
    <div class="stat-card" [ngClass]="variant">
      <div class="stat-card-top">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-icon-wrap" *ngIf="icon">
          <span class="material-icons">{{ icon }}</span>
        </div>
      </div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-foot" *ngIf="subtitle">{{ subtitle }}</div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--glass-bg, var(--white));
      border: 1px solid var(--glass-border, var(--line));
      border-radius: var(--premium-radius-sm, var(--r-lg));
      padding: 20px;
      box-shadow: var(--glass-shadow, var(--card-shadow)), var(--glass-inset, none);
      backdrop-filter: var(--glass-blur);
      transition: transform var(--t-med) var(--e-out), box-shadow var(--t-med), border-color var(--t-fast);
    }
    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(52, 211, 153, 0.45);
      box-shadow: 0 0 28px rgba(16, 185, 129, 0.1), var(--glass-shadow, var(--card-shadow-hover));
    }
    .stat-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .stat-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--ink-500);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: var(--r);
      display: grid;
      place-items: center;
    }
    .stat-icon-wrap .material-icons { font-size: 22px; }
    .stat-card.blue .stat-icon-wrap { background: var(--blue-50); color: var(--blue-600); }
    .stat-card.green .stat-icon-wrap { background: var(--green-50); color: var(--green-600); }
    .stat-card.orange .stat-icon-wrap { background: var(--warn-bg); color: var(--warn); }
    .stat-card.red .stat-icon-wrap { background: var(--bad-bg); color: var(--bad); }
    .stat-card.purple .stat-icon-wrap { background: var(--violet-bg); color: var(--violet); }
    .stat-value {
      font-size: clamp(1.75rem, 2.5vw, 2rem);
      font-weight: 800;
      color: var(--ink-900);
      margin: 12px 0 4px;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .stat-foot {
      font-size: 0.78rem;
      color: var(--ink-500);
    }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = '';
  @Input() subtitle = '';
  @Input() variant: StatCardVariant = 'blue';
}
