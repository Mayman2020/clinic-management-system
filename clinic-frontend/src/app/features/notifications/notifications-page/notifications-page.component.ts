import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/notification.model';
import { I18nService } from '../../../core/i18n/i18n.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-notifications-page', standalone: true,
  imports: [NgFor, NgIf, TranslateModule, MatButtonModule, MatProgressSpinnerModule, MatPaginatorModule, PageHeaderComponent],
  template: `<div class="page-shell">
    <app-page-header [title]="'NOTIFICATIONS.TITLE' | translate">
      <button mat-stroked-button type="button" (click)="markAllRead()">{{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}</button>
      <button mat-stroked-button type="button" (click)="load()">{{ 'COMMON.REFRESH' | translate }}</button>
    </app-page-header>
    <div class="estate-card" *ngIf="!loading; else loadingTpl">
      <div class="notif-row" *ngFor="let n of rows" [class.is-unread]="!n.read" (click)="markRead(n)">
        <div class="notif-title">{{ text(n.titleKey, n) }}</div>
        <div class="notif-body">{{ text(n.bodyKey, n) }}</div>
        <div class="notif-date">{{ n.createdAt }}</div>
      </div>
      <p *ngIf="!rows.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
      <mat-paginator [length]="total" [pageSize]="size" [pageIndex]="page" [pageSizeOptions]="[10,20]" (page)="onPage($event)"></mat-paginator>
    </div>
    <ng-template #loadingTpl><mat-spinner diameter="40"></mat-spinner></ng-template>
  </div>`,
  styles: [`.notif-row { padding: 12px 0; border-bottom: 1px solid var(--line); cursor: pointer; } .notif-row.is-unread { font-weight: 600; } .notif-body { color: var(--text-muted); font-size: 13px; margin-top: 4px; } .notif-date { font-size: 12px; color: var(--text-muted); margin-top: 4px; }`]
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
    private readonly snack: SnackService
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

  markRead(n: NotificationItem): void {
    if (n.read) return;
    this.svc.markRead(n.id).subscribe({ next: () => { n.read = true; }, error: (e) => this.snack.error(e.message) });
  }

  markAllRead(): void {
    this.svc.markAllRead().subscribe({ next: () => this.load(), error: (e) => this.snack.error(e.message) });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
}
