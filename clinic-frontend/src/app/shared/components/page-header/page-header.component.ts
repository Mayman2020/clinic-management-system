import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';
import { RmsIconBtnComponent } from '../rms-icon-btn/rms-icon-btn.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, TranslateModule, RmsIconBtnComponent],
  template: `
    <header class="app-page-header">
      <div class="page-heading">
        <p class="app-page-eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h1 class="app-page-title">{{ title }}</h1>
        <p class="app-page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
        <rms-icon-btn
          *ngIf="canGoBack"
          class="page-back-btn"
          icon="arrow_back"
          tooltipKey="COMMON.BACK"
          (clicked)="onBack()">
        </rms-icon-btn>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
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

  canGoBack = false;
  private sub?: Subscription;

  constructor(
    private readonly navHistory: NavigationHistoryService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.canGoBack = this.navHistory.canGoBack();
    this.sub = this.navHistory.canGoBack$.subscribe((v) => { this.canGoBack = v; });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onBack(): void {
    this.navHistory.goBack(this.location);
  }
}
