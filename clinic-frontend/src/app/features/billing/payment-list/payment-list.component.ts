import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { BillingService } from '../../../core/services/billing.service';
import { Payment } from '../../../core/models/billing.model';
import { SnackService } from '../../../core/services/snack.service';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { ListLoadController } from '../../../shared/utils/list-load.util';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TablePagerComponent, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, TranslateKeyPipe, RmsDatePipe],
  template: `<div class="page-shell">
    <app-page-header [title]="'BILLING.PAYMENTS' | translate">
      <div class="page-actions">
        <rms-icon-btn icon="receipt_long" tooltipKey="BILLING.TITLE" routerLink="/admin/billing"></rms-icon-btn>
        <rms-icon-btn icon="refresh" tooltipKey="COMMON.REFRESH" (clicked)="load()"></rms-icon-btn>
      </div>
    </app-page-header>
    <div class="loading-wrap" *ngIf="listLoad.showInitialSpinner"><mat-spinner diameter="40"></mat-spinner></div>
    <app-empty-state
      *ngIf="listLoad.showSurface && rows.length === 0 && !hasActiveFilters()"
      icon="payments"
      titleKey="BILLING.PAYMENTS"
      messageKey="COMMON.NO_DATA">
    </app-empty-state>
    <div class="app-list-surface" [class.is-refreshing]="listLoad.refreshing"
      *ngIf="listLoad.showSurface && (rows.length > 0 || hasActiveFilters())">
      <div class="list-refresh-spinner" *ngIf="listLoad.refreshing"><mat-spinner diameter="32"></mat-spinner></div>
      <section class="list-stats">
        <article class="stat-pill stat-pill--green"><span class="stat-label">{{ 'COMMON.TOTAL' | translate }}</span><strong>{{ total }}</strong></article>
        <article class="stat-pill stat-pill--cyan"><span class="stat-label">{{ 'COMMON.ON_PAGE' | translate }}</span><strong>{{ rows.length }}</strong></article>
      </section>
      <section class="estate-card directory-table-card">
      <div class="estate-table-toolbar directory-toolbar">
        <div class="directory-toolbar-top table-list-toolbar">
          <div class="directory-search">
            <span class="material-icons">search</span>
            <input [(ngModel)]="search" (keyup.enter)="onSearch()" [placeholder]="'COMMON.SEARCH' | translate">
          </div>
          <rms-icon-btn icon="search" tooltipKey="COMMON.SEARCH" variant="primary" (clicked)="onSearch()"></rms-icon-btn>
        </div>
      </div>
      <div class="app-table-wrap">
      <table mat-table [dataSource]="rows" class="app-data-table">
        <ng-container matColumnDef="paidAt">
          <th mat-header-cell *matHeaderCellDef>{{ 'BILLING.PAID_AT' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.paidAt | rmsDate:'datetime' }}</td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>{{ 'BILLING.AMOUNT' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.amount }}</td>
        </ng-container>
        <ng-container matColumnDef="paymentMethod">
          <th mat-header-cell *matHeaderCellDef>{{ 'BILLING.METHOD' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.paymentMethod | tk:'PAYMENT_METHOD' }}</td>
        </ng-container>
        <ng-container matColumnDef="referenceNo">
          <th mat-header-cell *matHeaderCellDef>{{ 'BILLING.REFERENCE' | translate }}</th>
          <td mat-cell *matCellDef="let row">{{ row.referenceNo || '—' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
      </div>
      <app-table-pager [length]="total" [pageSize]="size" [pageIndex]="page" (pageIndexChange)="onPageIndexChange($event)"></app-table-pager>
      </section>
    </div>
  </div>`,
  styles: []
})
export class PaymentListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 20;
  total = 0;
  search = '';
  rows: Payment[] = [];
  displayedColumns = ['paidAt', 'amount', 'paymentMethod', 'referenceNo'];

  constructor(private readonly svc: BillingService, private readonly snack: SnackService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    const params: Record<string, string | number> = {};
    if (this.search.trim()) params['q'] = this.search.trim();
    this.svc.listPayments(this.page, this.size, params).subscribe({
      next: (res) => {
        this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0;
        this.listLoad.end();
      },
      error: (e) => {
        this.snack.error(e.message);
        this.rows = [];
        this.total = 0;
        this.listLoad.end();
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!this.search.trim();
  }

  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
