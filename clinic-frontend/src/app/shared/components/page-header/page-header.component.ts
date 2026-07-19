import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';
import { RmsIconBtnComponent } from '../rms-icon-btn/rms-icon-btn.component';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TranslateModule, MatButtonModule, MatIconModule, MatTooltipModule, RmsIconBtnComponent],
  template: `
    <header class="app-page-header" role="banner">
      <div class="page-heading">
        <nav
          class="app-breadcrumb"
          *ngIf="breadcrumbs.length"
          [attr.aria-label]="'PAGE.BREADCRUMB_LABEL' | translate">
          <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
            <a *ngIf="!last && crumb.route" [routerLink]="crumb.route">{{ crumb.label }}</a>
            <span *ngIf="!last && !crumb.route">{{ crumb.label }}</span>
            <span class="sep" *ngIf="!last" aria-hidden="true">/</span>
            <span class="current" *ngIf="last">{{ crumb.label }}</span>
          </ng-container>
        </nav>
        <p class="app-page-eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h1 class="app-page-title">{{ title }}</h1>
        <p class="app-page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
        <rms-icon-btn
          *ngIf="shouldShowBack"
          class="page-back-btn"
          icon="arrow_back"
          tooltipKey="COMMON.BACK"
          (clicked)="onBackClick()">
        </rms-icon-btn>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .page-heading {
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .page-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
  `]
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() showBack = false;
  @Output() backClick = new EventEmitter<void>();

  canGoBack = false;
  private sub?: Subscription;

  constructor(
    private readonly navHistory: NavigationHistoryService,
    private readonly location: Location
  ) {}

  get shouldShowBack(): boolean {
    return this.showBack ? this.canGoBack : this.canGoBack;
  }

  ngOnInit(): void {
    this.canGoBack = this.navHistory.canGoBack();
    this.sub = this.navHistory.canGoBack$.subscribe((v) => { this.canGoBack = v; });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onBackClick(): void {
    if (this.backClick.observed) {
      this.backClick.emit();
      return;
    }
    this.navHistory.goBack(this.location);
  }
}
