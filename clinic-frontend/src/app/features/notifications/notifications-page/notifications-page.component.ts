import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/notification.model';
import { I18nService } from '../../../core/i18n/i18n.service';
import { SnackService } from '../../../core/services/snack.service';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-notifications-page', standalone: true,
  imports: [NgFor, NgIf, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TablePagerComponent, PageHeaderComponent, RmsIconBtnComponent, RmsDatePipe],
  template: `<div class="page-shell notifications-page">
    <app-page-header [title]="'NOTIFICATIONS.TITLE' | translate">
      <div class="page-actions">
        <rms-icon-btn icon="done_all" tooltipKey="NOTIFICATIONS.MARK_ALL_READ" (clicked)="markAllRead()"></rms-icon-btn>
        <rms-icon-btn icon="refresh" tooltipKey="COMMON.REFRESH" (clicked)="load()"></rms-icon-btn>
      </div>
    </app-page-header>
    <div class="loading-wrap" *ngIf="loading"><mat-spinner diameter="40"></mat-spinner></div>
    <div class="app-list-surface" *ngIf="!loading">
      <section class="list-stats">
        <article class="stat-pill stat-pill--rose"><span class="stat-label">{{ 'COMMON.TOTAL' | translate }}</span><strong>{{ total }}</strong></article>
        <article class="stat-pill stat-pill--cyan"><span class="stat-label">{{ 'COMMON.ON_PAGE' | translate }}</span><strong>{{ rows.length }}</strong></article>
      </section>
      <section class="estate-card notifications-card directory-table-card">
      <div class="notif-row" *ngFor="let n of rows" [class.is-unread]="!n.read" (click)="onClick(n)">
        <div class="notif-title">{{ text(n.titleKey, n) }}</div>
        <div class="notif-body">{{ text(n.bodyKey, n) }}</div>
        <div class="notif-date">{{ n.createdAt | rmsDate:'datetime' }}</div>
      </div>
      <p *ngIf="!rows.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
      <app-table-pager [length]="total" [pageSize]="size" [pageIndex]="page" (pageIndexChange)="onPageIndexChange($event)"></app-table-pager>
      </section>
    </div>
  </div>`,
  styles: []
})
export class NotificationsPageComponent implements OnInit {
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  rows: NotificationItem[] = [];

  constructor(
    private readonly svc: NotificationService,
    private readonly i18n: I18nService,
    private readonly snack: SnackService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.page, this.size).subscribe({
      next: (r) => { this.rows = r.data?.content ?? []; this.total = r.data?.totalElements ?? 0; this.loading = false; },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  text(key: string, n: NotificationItem): string {
    let params: Record<string, string> = {};
    if (n.varsJson) { try { params = JSON.parse(n.varsJson); } catch { /* ignore */ } }
    return this.i18n.instant(key, params);
  }

  onClick(n: NotificationItem): void {
    this.markRead(n);
    if (!n.referenceType || !n.referenceId) return;
    const type = n.referenceType;
    const id = n.referenceId;
    if (type === 'Appointment') void this.router.navigate(['/admin/appointments']);
    else if (type === 'Consultation') void this.router.navigate(['/admin/consultation', id]);
    else if (type === 'LabRequest') void this.router.navigate(['/admin/lab']);
    else if (type === 'RadiologyRequest') void this.router.navigate(['/admin/radiology']);
    else if (type === 'Invoice') void this.router.navigate(['/admin/billing', id]);
  }

  markRead(n: NotificationItem): void {
    if (n.read) return;
    this.svc.markRead(n.id).subscribe({ next: () => { n.read = true; }, error: (e) => this.snack.error(e.message) });
  }

  markAllRead(): void {
    this.svc.markAllRead().subscribe({ next: () => this.load(), error: (e) => this.snack.error(e.message) });
  }

  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
