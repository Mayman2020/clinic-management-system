import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { LookupDialogComponent } from '../lookup-dialog/lookup-dialog.component';
import { I18nService } from '../../../core/i18n/i18n.service';
import { SnackService } from '../../../core/services/snack.service';

interface LookupTab {
  type: LookupType;
  labelKey: string;
  items: LookupItem[];
  loading: boolean;
}

@Component({
  selector: 'app-lookup-management', standalone: true,
  imports: [
    NgFor, NgIf, TranslateModule, MatTabsModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, PageHeaderComponent, RmsIconBtnComponent
  ],
  template: `
    <div class="page-shell">
      <app-page-header [title]="'LOOKUPS.TITLE' | translate" [subtitle]="'LOOKUPS.SUBTITLE' | translate">
        <rms-icon-btn icon="refresh" tooltipKey="COMMON.REFRESH" (clicked)="loadAll()"></rms-icon-btn>
      </app-page-header>

      <section class="estate-card lookup-admin-card">
        <mat-tab-group animationDuration="200ms">
          <mat-tab *ngFor="let tab of tabs" [label]="tab.labelKey | translate">
            <div class="lookup-tab-body">
              <div class="lookup-tab-toolbar">
                <rms-icon-btn icon="add" tooltipKey="LOOKUPS.NEW" variant="primary" (clicked)="openCreate(tab)"></rms-icon-btn>
              </div>
              <div class="loading-wrap" *ngIf="tab.loading"><mat-spinner diameter="36"></mat-spinner></div>
              <table class="app-data-table" *ngIf="!tab.loading">
                <thead>
                  <tr>
                    <th>{{ 'LOOKUPS.CODE' | translate }}</th>
                    <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th>
                    <th>{{ 'LOOKUPS.NAME_EN' | translate }}</th>
                    <th>{{ 'LOOKUPS.SORT_ORDER' | translate }}</th>
                    <th>{{ 'COMMON.STATUS' | translate }}</th>
                    <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of tab.items">
                    <td>{{ item.code }}</td>
                    <td>{{ item.nameAr }}</td>
                    <td>{{ item.nameEn }}</td>
                    <td>{{ item.sortOrder }}</td>
                    <td>{{ item.active ? ('LOOKUPS.ACTIVE' | translate) : ('LOOKUPS.INACTIVE' | translate) }}</td>
                    <td class="action-cell">
                      <button mat-icon-button type="button" (click)="openEdit(tab, item)"><span class="material-icons">edit</span></button>
                      <button mat-icon-button type="button" *ngIf="!item.locked" (click)="remove(item, tab)"><span class="material-icons">delete</span></button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p class="empty-state" *ngIf="!tab.loading && !tab.items.length">{{ 'COMMON.NO_DATA' | translate }}</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>
    </div>
  `,
  styles: [`
    .lookup-admin-card { padding: 0; overflow: hidden; }
    .lookup-tab-body { padding: 16px 20px 24px; }
    .lookup-tab-toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
    .empty-state { text-align: center; padding: 24px; color: var(--ink-500); }
  `]
})
export class LookupManagementComponent implements OnInit {
  tabs: LookupTab[] = [
    { type: 'SPECIALTY', labelKey: 'LOOKUPS.TAB_SPECIALTY', items: [], loading: false },
    { type: 'DEPARTMENT', labelKey: 'LOOKUPS.TAB_DEPARTMENT', items: [], loading: false },
    { type: 'LAB_TEST_TYPE', labelKey: 'LOOKUPS.TAB_LAB_TYPE', items: [], loading: false },
    { type: 'LAB_TEST_CATEGORY', labelKey: 'LOOKUPS.TAB_LAB_CATEGORY', items: [], loading: false },
    { type: 'RADIOLOGY_STUDY_TYPE', labelKey: 'LOOKUPS.TAB_RADIOLOGY', items: [], loading: false },
    { type: 'PAYMENT_METHOD', labelKey: 'LOOKUPS.TAB_PAYMENT', items: [], loading: false }
  ];

  constructor(
    private readonly lookupSvc: LookupService,
    private readonly dialogs: RmsDialogService,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void { this.tabs.forEach((t) => this.loadTab(t)); }

  loadTab(tab: LookupTab): void {
    tab.loading = true;
    this.lookupSvc.getAllByType(tab.type).subscribe({
      next: (res) => { tab.items = res.data ?? []; tab.loading = false; },
      error: (e) => { this.snack.error(e.message); tab.loading = false; }
    });
  }

  openCreate(tab: LookupTab): void {
    this.dialogs.open(LookupDialogComponent, { width: '520px', data: { type: tab.type } })
      .afterClosed().subscribe((ok) => { if (ok) this.loadTab(tab); });
  }

  openEdit(tab: LookupTab, item: LookupItem): void {
    this.dialogs.open(LookupDialogComponent, { width: '520px', data: { type: tab.type, item } })
      .afterClosed().subscribe((ok) => { if (ok) this.loadTab(tab); });
  }

  remove(item: LookupItem, tab: LookupTab): void {
    this.dialogs.confirmDelete().subscribe((ok) => {
      if (!ok) return;
      this.lookupSvc.delete(item.id).subscribe({
        next: () => { this.snack.success('COMMON.DELETED'); this.loadTab(tab); },
        error: (e) => this.snack.error(e.message)
      });
    });
  }
}
