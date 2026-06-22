/** Layout, dashboard, remaining features, admin routes */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let n = 0;
function w(rel, c) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c, 'utf8');
  n++;
}

// LAYOUT
w('clinic-frontend/src/app/layout/main-layout/main-layout.component.ts', `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  selector: 'app-main-layout', standalone: true,
  imports: [RouterOutlet, NgClass, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  sidebarCollapsed = false;
  constructor(readonly i18n: I18nService) {}
  get lang(): 'ar' | 'en' { return this.i18n.currentLang; }
  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }
}
`);

w('clinic-frontend/src/app/layout/main-layout/main-layout.component.html', `<div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed">
  <app-sidebar [collapsed]="sidebarCollapsed" [lang]="lang" (collapseToggle)="toggleSidebar()"></app-sidebar>
  <div class="main-area">
    <app-topbar [sidebarCollapsed]="sidebarCollapsed" (sidebarToggle)="toggleSidebar()"></app-topbar>
    <main class="main-content"><router-outlet></router-outlet></main>
  </div>
</div>`);

w('clinic-frontend/src/app/layout/main-layout/main-layout.component.scss', `:host { display: block; height: 100%; }\n`);

w('clinic-frontend/src/app/layout/sidebar/sidebar.component.ts', `import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserRole } from '../../core/models/user.model';

interface NavItem {
  icon: string; labelKey: string; route: string; roles: UserRole[]; permissionKey: string;
  sectionKey: 'NAV_SECTION.OVERVIEW' | 'NAV_SECTION.CLINICAL' | 'NAV_SECTION.OPERATIONS' | 'NAV_SECTION.FINANCE' | 'NAV_SECTION.ADMIN';
}

@Component({
  selector: 'app-sidebar', standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive, MatTooltipModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() lang: 'ar' | 'en' = 'ar';
  @Output() collapseToggle = new EventEmitter<void>();

  sectionExpanded: Record<string, boolean> = {
    'NAV_SECTION.OVERVIEW': true, 'NAV_SECTION.CLINICAL': true, 'NAV_SECTION.OPERATIONS': true,
    'NAV_SECTION.FINANCE': true, 'NAV_SECTION.ADMIN': true
  };

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/admin/dashboard', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE','LAB_TECHNICIAN','RADIOLOGY_STAFF','CASHIER'], permissionKey: 'dashboard', sectionKey: 'NAV_SECTION.OVERVIEW' },
    { icon: 'groups', labelKey: 'NAV.PATIENTS', route: '/admin/patients', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE','CASHIER'], permissionKey: 'patients', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'medical_services', labelKey: 'NAV.DOCTORS', route: '/admin/doctors', roles: ['ADMIN','RECEPTIONIST','DOCTOR'], permissionKey: 'doctors', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/admin/appointments', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], permissionKey: 'appointments', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'calendar_month', labelKey: 'NAV.CALENDAR', route: '/admin/calendar', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], permissionKey: 'calendar', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'queue', labelKey: 'NAV.QUEUE', route: '/admin/queue', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], permissionKey: 'queue', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'tv', labelKey: 'NAV.QUEUE_TV', route: '/queue/tv', roles: ['ADMIN','RECEPTIONIST','NURSE'], permissionKey: 'queue', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'assignment', labelKey: 'NAV.CONSULTATION', route: '/admin/consultation', roles: ['ADMIN','DOCTOR','NURSE'], permissionKey: 'consultation', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'medication', labelKey: 'NAV.PRESCRIPTION', route: '/admin/prescription', roles: ['ADMIN','DOCTOR'], permissionKey: 'prescription', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'science', labelKey: 'NAV.LAB', route: '/admin/lab', roles: ['ADMIN','DOCTOR','LAB_TECHNICIAN'], permissionKey: 'lab', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'radiology', labelKey: 'NAV.RADIOLOGY', route: '/admin/radiology', roles: ['ADMIN','DOCTOR','RADIOLOGY_STAFF'], permissionKey: 'radiology', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'receipt_long', labelKey: 'NAV.BILLING', route: '/admin/billing', roles: ['ADMIN','RECEPTIONIST','CASHIER'], permissionKey: 'billing', sectionKey: 'NAV_SECTION.FINANCE' },
    { icon: 'health_and_safety', labelKey: 'NAV.INSURANCE', route: '/admin/insurance', roles: ['ADMIN','CASHIER'], permissionKey: 'insurance', sectionKey: 'NAV_SECTION.FINANCE' },
    { icon: 'bar_chart', labelKey: 'NAV.REPORTS', route: '/admin/reports', roles: ['ADMIN','CASHIER'], permissionKey: 'reports', sectionKey: 'NAV_SECTION.FINANCE' },
    { icon: 'settings', labelKey: 'NAV.SETTINGS', route: '/admin/settings', roles: ['ADMIN'], permissionKey: 'settings', sectionKey: 'NAV_SECTION.ADMIN' },
    { icon: 'manage_accounts', labelKey: 'NAV.USERS', route: '/admin/users', roles: ['ADMIN'], permissionKey: 'users', sectionKey: 'NAV_SECTION.ADMIN' },
  ];

  constructor(readonly auth: AuthService, private readonly permissions: PermissionService, private readonly router: Router) {}

  get visibleSections() {
    const role = this.auth.getRole();
    const items = this.navItems.filter((i) => role && i.roles.includes(role) && this.permissions.can(i.permissionKey, 'menu'));
    const keys = ['NAV_SECTION.OVERVIEW','NAV_SECTION.CLINICAL','NAV_SECTION.OPERATIONS','NAV_SECTION.FINANCE','NAV_SECTION.ADMIN'];
    return keys.map((k) => ({ key: k, items: items.filter((i) => i.sectionKey === k) })).filter((s) => s.items.length);
  }

  get currentUser() { return this.auth.getCurrentUser(); }
  get currentUserDisplayName(): string {
    const u = this.currentUser;
    if (!u) return '';
    const ar = (u.fullNameAr ?? '').trim();
    const en = (u.fullNameEn ?? '').trim();
    return this.lang === 'ar' ? (ar || en || u.fullName) : (en || ar || u.fullName);
  }
  get roleKey(): string { const r = this.auth.getRole(); return r ? \`ROLE.\${r}\` : ''; }
  logout(): void { this.auth.logout(); }
  toggleSection(k: string): void { this.sectionExpanded[k] = !this.sectionExpanded[k]; }
  trackBySection(_: number, s: { key: string }) { return s.key; }
  trackByRoute(_: number, i: NavItem) { return i.route; }
  isForcedActive(item: NavItem): boolean { return this.router.url.split('?')[0] === item.route; }
}
`);

w('clinic-frontend/src/app/layout/sidebar/sidebar.component.html', `<aside class="sidebar" [class.collapsed]="collapsed">
  <div class="sidebar-brand">
    <div class="brand-icon"><span class="material-icons">local_hospital</span></div>
    <div class="brand-text" *ngIf="!collapsed">
      <span class="brand-name">{{ 'APP.NAME' | translate }}</span>
      <span class="brand-tagline">{{ 'APP.TAGLINE_SHORT' | translate }}</span>
    </div>
    <button class="collapse-btn" type="button" (click)="collapseToggle.emit()"><span class="material-icons">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span></button>
  </div>
  <nav class="sidebar-nav">
    <ng-container *ngFor="let section of visibleSections; trackBy: trackBySection">
      <button class="nav-section-toggle" *ngIf="!collapsed" type="button" (click)="toggleSection(section.key)">
        <span class="nav-section-label">{{ section.key | translate }}</span>
      </button>
      <div class="nav-section-items">
        <a class="nav-item" *ngFor="let item of section.items; trackBy: trackByRoute" [routerLink]="item.route" routerLinkActive="active" [class.active]="isForcedActive(item)" [matTooltip]="collapsed ? (item.labelKey | translate) : ''">
          <span class="nav-icon material-icons">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="!collapsed">{{ item.labelKey | translate }}</span>
        </a>
      </div>
    </ng-container>
  </nav>
  <div class="sidebar-user">
    <div class="user-avatar">{{ currentUser?.initials || 'U' }}</div>
    <div class="user-info" *ngIf="!collapsed">
      <span class="user-name">{{ currentUserDisplayName || '-' }}</span>
      <span class="user-role" *ngIf="roleKey">{{ roleKey | translate }}</span>
    </div>
  </div>
  <button class="sidebar-logout" (click)="logout()"><span class="material-icons">logout</span><span *ngIf="!collapsed">{{ 'AUTH.LOGOUT' | translate }}</span></button>
</aside>`);

w('clinic-frontend/src/app/layout/sidebar/sidebar.component.scss', `:host { display: block; }\n`);

w('clinic-frontend/src/app/layout/topbar/topbar.component.ts', `import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService, LanguageOption } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserRole } from '../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar', standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, TranslateModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatDividerModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  constructor(readonly theme: ThemeService, readonly i18n: I18nService, readonly auth: AuthService,
    private readonly permissions: PermissionService, private readonly router: Router) {}
  get currentUser() { return this.auth.getCurrentUser(); }
  get currentUserDisplayName(): string {
    const u = this.currentUser; if (!u) return '';
    return this.i18n.currentLang === 'ar' ? (u.fullNameAr || u.fullNameEn || u.fullName) : (u.fullNameEn || u.fullNameAr || u.fullName);
  }
  get roleKey(): string { const r = this.auth.getRole(); return r ? \`ROLE.\${r}\` : ''; }
  get switchableRoles(): UserRole[] { return this.auth.getEffectiveRoles(); }
  get languages(): LanguageOption[] { return this.i18n.languages; }
  get activeLanguage(): LanguageOption { return this.languages.find((l) => l.code === this.i18n.currentLang) ?? this.languages[0]; }
  isRoleActive(role: UserRole): boolean { return this.auth.getRole() === role; }
  switchLang(lang: LanguageOption): void { this.i18n.setLang(lang.code).subscribe(); }
  toggleTheme(): void { this.theme.toggle(); }
  logout(): void { this.auth.logout(); }
  switchRole(role: UserRole): void {
    if (this.isRoleActive(role)) return;
    this.auth.setActiveRole(role);
    this.permissions.loadMine().subscribe({ next: () => void this.router.navigateByUrl(this.auth.getDashboardRoute()) });
  }
}
`);

w('clinic-frontend/src/app/layout/topbar/topbar.component.html', `<header class="topbar">
  <div class="topbar-start">
    <button class="tb-action-btn" (click)="sidebarToggle.emit()" [matTooltip]="'TOPBAR.TOGGLE_MENU' | translate"><span class="material-icons">{{ sidebarCollapsed ? 'menu_open' : 'menu' }}</span></button>
  </div>
  <div class="topbar-end">
    <button class="tb-action-btn" [matMenuTriggerFor]="langMenu"><img class="flag" [src]="activeLanguage.flagUrl" alt=""><span class="lang-name">{{ activeLanguage.nativeLabel }}</span></button>
    <mat-menu #langMenu="matMenu"><button mat-menu-item *ngFor="let lang of languages" (click)="switchLang(lang)"><img class="flag" [src]="lang.flagUrl" alt=""><span>{{ lang.nativeLabel }}</span></button></mat-menu>
    <button class="tb-action-btn" (click)="toggleTheme()"><span class="material-icons">{{ (theme.isDark$ | async) ? 'light_mode' : 'dark_mode' }}</span></button>
    <button class="tb-action-btn" [matMenuTriggerFor]="roleMenu" *ngIf="switchableRoles.length > 1"><span class="material-icons">manage_accounts</span></button>
    <mat-menu #roleMenu="matMenu"><button mat-menu-item *ngFor="let role of switchableRoles" (click)="switchRole(role)" [disabled]="isRoleActive(role)">{{ ('ROLE.' + role) | translate }}</button></mat-menu>
    <button class="tb-user-btn" [matMenuTriggerFor]="userMenu"><div class="tb-avatar">{{ currentUser?.initials || 'U' }}</div><span class="tb-user-name">{{ currentUserDisplayName }}</span></button>
    <mat-menu #userMenu="matMenu"><button mat-menu-item (click)="logout()"><span class="material-icons">logout</span>{{ 'AUTH.LOGOUT' | translate }}</button></mat-menu>
  </div>
</header>`);

w('clinic-frontend/src/app/layout/topbar/topbar.component.scss', `:host { display: block; }\n`);

// DASHBOARD with charts
w('clinic-frontend/src/app/features/dashboard/dashboard/dashboard.component.ts', `import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { SnackService } from '../../../core/services/snack.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, TranslateModule, MatIconModule, MatProgressSpinnerModule, BaseChartDirective, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats: DashboardStats | null = null;
  revenueChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: 'Revenue', borderColor: '#b48a40', backgroundColor: 'rgba(180,138,64,0.15)', fill: true, tension: 0.35 }] };
  appointmentsChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Appointments', backgroundColor: '#1b3553' }] };
  lineOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  constructor(private readonly dash: DashboardService, private readonly snack: SnackService) {}

  ngOnInit(): void {
    forkJoin({ stats: this.dash.getStats(), revenue: this.dash.getRevenueChart(), appointments: this.dash.getAppointmentsChart() }).subscribe({
      next: ({ stats, revenue, appointments }) => {
        this.stats = stats.data ?? null;
        const rev = revenue.data ?? [];
        this.revenueChart = { labels: rev.map((p) => p.label), datasets: [{ ...this.revenueChart.datasets[0], data: rev.map((p) => p.value) }] };
        const apt = appointments.data ?? [];
        this.appointmentsChart = { labels: apt.map((p) => p.label), datasets: [{ ...this.appointmentsChart.datasets[0], data: apt.map((p) => p.value) }] };
        this.loading = false;
      },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }
}
`);

w('clinic-frontend/src/app/features/dashboard/dashboard/dashboard.component.html', `<div class="page-shell dashboard-page">
  <app-page-header [title]="'DASHBOARD.TITLE' | translate"></app-page-header>
  <mat-spinner *ngIf="loading" diameter="40"></mat-spinner>
  <ng-container *ngIf="!loading">
    <div class="estate-stat-grid">
      <div class="estate-stat-card"><span class="estate-stat-label">{{ 'DASHBOARD.PATIENTS_TODAY' | translate }}</span><span class="estate-stat-value">{{ stats?.patientsToday ?? 0 }}</span></div>
      <div class="estate-stat-card"><span class="estate-stat-label">{{ 'DASHBOARD.APPOINTMENTS' | translate }}</span><span class="estate-stat-value">{{ stats?.appointmentsToday ?? 0 }}</span></div>
      <div class="estate-stat-card"><span class="estate-stat-label">{{ 'DASHBOARD.QUEUE_WAITING' | translate }}</span><span class="estate-stat-value">{{ stats?.queueWaiting ?? 0 }}</span></div>
      <div class="estate-stat-card"><span class="estate-stat-label">{{ 'DASHBOARD.REVENUE' | translate }}</span><span class="estate-stat-value">{{ stats?.revenueToday ?? 0 | number:'1.0-0' }}</span></div>
    </div>
    <div class="dashboard-charts">
      <div class="estate-card chart-card"><h3>{{ 'DASHBOARD.REVENUE' | translate }}</h3><div class="chart-wrap"><canvas baseChart [data]="revenueChart" [options]="lineOptions" type="line"></canvas></div></div>
      <div class="estate-card chart-card"><h3>{{ 'DASHBOARD.APPOINTMENTS' | translate }}</h3><div class="chart-wrap"><canvas baseChart [data]="appointmentsChart" [options]="barOptions" type="bar"></canvas></div></div>
    </div>
  </ng-container>
</div>`);

w('clinic-frontend/src/app/features/dashboard/dashboard/dashboard.component.scss', `.dashboard-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.chart-card h3 { margin: 0 0 12px; } .chart-wrap { height: 260px; }
@media (max-width: 900px) { .dashboard-charts { grid-template-columns: 1fr; } }
`);

// Calendar, Queue, Consultation, Settings, Reports, Queue TV, Patient dialog, Doctors schedules
w('clinic-frontend/src/app/features/calendar/calendar-view/calendar-view.component.ts', `import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-calendar-view', standalone: true,
  imports: [NgFor, NgIf, DatePipe, TranslateModule, MatButtonModule, PageHeaderComponent],
  template: \`<div class="page-shell"><app-page-header [title]="'NAV.CALENDAR' | translate"><button mat-stroked-button (click)="load()">{{ 'COMMON.REFRESH' | translate }}</button></app-page-header>
  <div class="estate-card" *ngIf="!loading"><div class="calendar-row" *ngFor="let a of rows"><strong>{{ a.appointmentDate | date:'dd/MM/yyyy' }}</strong> {{ a.startTime }} — {{ a.patientName || a.patientId }} / {{ a.doctorName || a.doctorId }} <span class="badge">{{ a.status }}</span></div>
  <p *ngIf="!rows.length">{{ 'COMMON.NO_DATA' | translate }}</p></div></div>\`,
  styles: [\`.calendar-row { padding: 10px 0; border-bottom: 1px solid var(--line); display: flex; gap: 12px; align-items: center; flex-wrap: wrap; } .badge { background: var(--accent-soft); padding: 2px 8px; border-radius: 999px; font-size: 12px; }\`]
})
export class CalendarViewComponent implements OnInit {
  loading = false; rows: Appointment[] = [];
  constructor(private readonly svc: AppointmentService, private readonly snack: SnackService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    const from = new Date(); from.setDate(1);
    const to = new Date(from); to.setMonth(to.getMonth() + 1);
    this.svc.getCalendar(from.toISOString().slice(0,10), to.toISOString().slice(0,10)).subscribe({
      next: (res) => { this.rows = res.data ?? []; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }
}
`);

w('clinic-frontend/src/app/features/queue/queue-dashboard/queue-dashboard.component.ts', `import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { QueueService } from '../../../core/services/queue.service';
import { QueueToken } from '../../../core/models/queue.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-queue-dashboard', standalone: true,
  imports: [NgFor, NgIf, RouterLink, TranslateModule, MatButtonModule, PageHeaderComponent],
  template: \`<div class="page-shell"><app-page-header [title]="'QUEUE.TITLE' | translate">
    <button mat-flat-button color="primary" (click)="callNext()">{{ 'QUEUE.CALL_NEXT' | translate }}</button>
    <a mat-stroked-button routerLink="/queue/tv">{{ 'QUEUE.TV_MODE' | translate }}</a>
  </app-page-header>
  <div class="estate-card queue-grid"><div class="queue-token" *ngFor="let t of tokens"><div class="num">{{ t.tokenNumber }}</div><div>{{ t.patientName || t.patientId }}</div><div class="status">{{ t.status }}</div></div></div></div>\`,
  styles: [\`.queue-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: 12px; } .queue-token { border: 1px solid var(--line); border-radius: 12px; padding: 12px; text-align: center; } .num { font-size: 28px; font-weight: 700; color: var(--accent); }\`]
})
export class QueueDashboardComponent implements OnInit {
  tokens: QueueToken[] = [];
  constructor(private readonly svc: QueueService, private readonly snack: SnackService) {}
  ngOnInit(): void { this.refresh(); }
  refresh(): void { this.svc.getToday().subscribe({ next: (r) => this.tokens = r.data ?? [], error: (e) => this.snack.error(e.message) }); }
  callNext(): void { this.svc.callNext().subscribe({ next: () => this.refresh(), error: (e) => this.snack.error(e.message) }); }
}
`);

w('clinic-frontend/src/app/features/queue/queue-tv/queue-tv.component.ts', `import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { QueueService } from '../../../core/services/queue.service';
import { QueueToken } from '../../../core/models/queue.model';

@Component({
  selector: 'app-queue-tv', standalone: true, imports: [NgFor, NgIf, TranslateModule],
  template: \`<div class="tv-shell"><h1>{{ 'QUEUE.TITLE' | translate }}</h1><div class="tv-grid"><div class="tv-token" *ngFor="let t of tokens"><div class="n">{{ t.tokenNumber }}</div><div>{{ t.patientName }}</div><div>{{ t.status }}</div></div></div></div>\`,
  styles: [\`:host { display: block; min-height: 100vh; background: #0e1f33; color: #fff; } .tv-shell { padding: 32px; } .tv-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; } .tv-token { background: rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; text-align: center; } .n { font-size: 64px; font-weight: 700; color: #cca55b; }\`]
})
export class QueueTvComponent implements OnInit, OnDestroy {
  tokens: QueueToken[] = []; private timer?: ReturnType<typeof setInterval>;
  constructor(private readonly svc: QueueService) {}
  ngOnInit(): void { this.load(); this.timer = setInterval(() => this.load(), 10000); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  load(): void { this.svc.getTvDisplay().subscribe({ next: (r) => this.tokens = r.data ?? [] }); }
}
`);

w('clinic-frontend/src/app/features/consultation/consultation-form/consultation-form.component.ts', `import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConsultationService } from '../../../core/services/consultation.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-consultation-form', standalone: true,
  imports: [NgIf, ReactiveFormsModule, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, PageHeaderComponent],
  template: \`<div class="page-shell"><app-page-header [title]="'CONSULTATION.TITLE' | translate"></app-page-header>
  <form class="estate-card emr-form" [formGroup]="form" (ngSubmit)="save()">
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.CHIEF_COMPLAINT' | translate }}</mat-label><textarea matInput rows="3" formControlName="chiefComplaint"></textarea></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.DIAGNOSIS' | translate }}</mat-label><textarea matInput rows="3" formControlName="diagnosis"></textarea></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.NOTES' | translate }}</mat-label><textarea matInput rows="4" formControlName="notes"></textarea></mat-form-field>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </form></div>\`,
  styles: [\`.emr-form { display: flex; flex-direction: column; gap: 12px; max-width: 720px; }\`]
})
export class ConsultationFormComponent implements OnInit {
  form = this.fb.group({ patientId: [null as number | null], doctorId: [null as number | null], chiefComplaint: [''], diagnosis: [''], notes: [''] });
  constructor(private readonly fb: FormBuilder, private readonly svc: ConsultationService, private readonly snack: SnackService) {}
  ngOnInit(): void {}
  save(): void {
    this.svc.create(this.form.getRawValue()).subscribe({ next: () => this.snack.success('Saved'), error: (e) => this.snack.error(e.message) });
  }
}
`);

w('clinic-frontend/src/app/features/settings/settings-page/settings-page.component.ts', `import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SettingsService } from '../../../core/services/settings.service';
import { ClinicSetting } from '../../../core/models/settings.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-settings-page', standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, PageHeaderComponent],
  template: \`<div class="page-shell"><app-page-header [title]="'SETTINGS.TITLE' | translate"></app-page-header>
  <div class="estate-card" *ngFor="let s of settings"><mat-form-field appearance="outline"><mat-label>{{ s.key }}</mat-label><input matInput [(ngModel)]="s.value"></mat-form-field>
  <button mat-stroked-button (click)="save(s)">{{ 'COMMON.SAVE' | translate }}</button></div></div>\`
})
export class SettingsPageComponent implements OnInit {
  settings: ClinicSetting[] = [];
  constructor(private readonly svc: SettingsService, private readonly snack: SnackService) {}
  ngOnInit(): void { this.svc.getAll().subscribe({ next: (r) => this.settings = r.data ?? [], error: (e) => this.snack.error(e.message) }); }
  save(s: ClinicSetting): void { this.svc.update(s.key, s.value).subscribe({ next: () => this.snack.success('Saved'), error: (e) => this.snack.error(e.message) }); }
}
`);

w('clinic-frontend/src/app/features/reports/reports-dashboard/reports-dashboard.component.ts', `import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ReportService } from '../../../core/services/report.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports-dashboard', standalone: true,
  imports: [NgIf, TranslateModule, BaseChartDirective, PageHeaderComponent],
  template: \`<div class="page-shell"><app-page-header [title]="'REPORTS.TITLE' | translate"></app-page-header>
  <div class="reports-grid"><div class="estate-card chart-card"><h3>{{ 'DASHBOARD.REVENUE' | translate }}</h3><div class="chart-wrap"><canvas baseChart [data]="revenue" [options]="opts" type="bar"></canvas></div></div>
  <div class="estate-card chart-card"><h3>{{ 'DASHBOARD.APPOINTMENTS' | translate }}</h3><div class="chart-wrap"><canvas baseChart [data]="appointments" [options]="opts" type="line"></canvas></div></div></div></div>\`,
  styles: [\`.reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .chart-wrap { height: 280px; }\`]
})
export class ReportsDashboardComponent implements OnInit {
  revenue: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: '#b48a40' }] };
  appointments: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], borderColor: '#1b3553', fill: false }] };
  opts: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };
  constructor(private readonly reports: ReportService) {}
  ngOnInit(): void {
    forkJoin({ revenue: this.reports.revenue(), appointments: this.reports.appointments() }).subscribe(({ revenue, appointments }) => {
      const rev = revenue.data ?? []; this.revenue = { labels: rev.map(p => p.label), datasets: [{ data: rev.map(p => p.value), backgroundColor: '#b48a40' }] };
      const apt = appointments.data ?? []; this.appointments = { labels: apt.map(p => p.label), datasets: [{ data: apt.map(p => p.value), borderColor: '#1b3553', fill: false }] };
    });
  }
}
`);

w('clinic-frontend/src/app/features/doctors/doctor-schedules/doctor-schedules.component.ts', `import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { DoctorSchedule } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-doctor-schedules', standalone: true, imports: [NgFor, NgIf, TranslateModule],
  template: \`<div *ngIf="schedules.length"><div *ngFor="let s of schedules">{{ s.dayOfWeek }} {{ s.startTime }}-{{ s.endTime }}</div></div><p *ngIf="!schedules.length">{{ 'COMMON.NO_DATA' | translate }}</p>\`
})
export class DoctorSchedulesComponent implements OnInit {
  @Input() doctorId!: number;
  schedules: DoctorSchedule[] = [];
  constructor(private readonly svc: DoctorService) {}
  ngOnInit(): void { if (this.doctorId) this.svc.getSchedules(this.doctorId).subscribe({ next: (r) => this.schedules = r.data ?? [] }); }
}
`);

w('clinic-frontend/src/app/features/patients/patient-dialog/patient-dialog.component.ts', `import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-patient-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: \`<h2 mat-dialog-title>{{ (data?.id ? 'COMMON.EDIT' : 'PATIENTS.NEW') | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.NAME' | translate }}</mat-label><input matInput formControlName="firstName"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.NAME' | translate }}</mat-label><input matInput formControlName="lastName"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>\`
})
export class PatientDialogComponent {
  form = this.fb.group({ firstName: ['', Validators.required], lastName: ['', Validators.required], phone: [''], gender: [''], email: [''] });
  constructor(private readonly fb: FormBuilder, private readonly svc: PatientService, private readonly snack: SnackService,
    private readonly ref: MatDialogRef<PatientDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Partial<Patient> | null) {
    if (data) this.form.patchValue(data);
  }
  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    const req = this.data?.id ? this.svc.update(this.data.id, payload) : this.svc.create(payload);
    req.subscribe({ next: () => { this.snack.success('Saved'); this.ref.close(true); }, error: (e) => this.snack.error(e.message) });
  }
}
`);

// ADMIN ROUTES
w('clinic-frontend/src/app/features/admin/admin.routes.ts', `import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { adminGuard, permissionGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', component: MainLayoutComponent, canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [permissionGuard], data: { permission: 'dashboard', permissionAction: 'view' }, loadComponent: () => import('../dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'patients', canActivate: [permissionGuard], data: { permission: 'patients', permissionAction: 'view' }, loadComponent: () => import('../patients/patient-list/patient-list.component').then(m => m.PatientListComponent) },
      { path: 'doctors', canActivate: [permissionGuard], data: { permission: 'doctors', permissionAction: 'view' }, loadComponent: () => import('../doctors/doctor-list/doctor-list.component').then(m => m.DoctorListComponent) },
      { path: 'appointments', canActivate: [permissionGuard], data: { permission: 'appointments', permissionAction: 'view' }, loadComponent: () => import('../appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent) },
      { path: 'calendar', canActivate: [permissionGuard], data: { permission: 'calendar', permissionAction: 'view' }, loadComponent: () => import('../calendar/calendar-view/calendar-view.component').then(m => m.CalendarViewComponent) },
      { path: 'queue', canActivate: [permissionGuard], data: { permission: 'queue', permissionAction: 'view' }, loadComponent: () => import('../queue/queue-dashboard/queue-dashboard.component').then(m => m.QueueDashboardComponent) },
      { path: 'consultation', canActivate: [permissionGuard], data: { permission: 'consultation', permissionAction: 'view' }, loadComponent: () => import('../consultation/consultation-form/consultation-form.component').then(m => m.ConsultationFormComponent) },
      { path: 'prescription', canActivate: [permissionGuard], data: { permission: 'prescription', permissionAction: 'view' }, loadComponent: () => import('../prescription/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent) },
      { path: 'lab', canActivate: [permissionGuard], data: { permission: 'lab', permissionAction: 'view' }, loadComponent: () => import('../lab/lab-list/lab-list.component').then(m => m.LabListComponent) },
      { path: 'radiology', canActivate: [permissionGuard], data: { permission: 'radiology', permissionAction: 'view' }, loadComponent: () => import('../radiology/radiology-list/radiology-list.component').then(m => m.RadiologyListComponent) },
      { path: 'billing', canActivate: [permissionGuard], data: { permission: 'billing', permissionAction: 'view' }, loadComponent: () => import('../billing/billing-list/billing-list.component').then(m => m.BillingListComponent) },
      { path: 'insurance', canActivate: [permissionGuard], data: { permission: 'insurance', permissionAction: 'view' }, loadComponent: () => import('../insurance/insurance-list/insurance-list.component').then(m => m.InsuranceListComponent) },
      { path: 'reports', canActivate: [permissionGuard], data: { permission: 'reports', permissionAction: 'view' }, loadComponent: () => import('../reports/reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent) },
      { path: 'settings', canActivate: [permissionGuard], data: { permission: 'settings', permissionAction: 'view' }, loadComponent: () => import('../settings/settings-page/settings-page.component').then(m => m.SettingsPageComponent) },
      { path: 'users', canActivate: [permissionGuard], data: { permission: 'users', permissionAction: 'view' }, loadComponent: () => import('../users/user-list/user-list.component').then(m => m.UserListComponent) },
    ]
  }
];
`);

console.log('Layout + features + admin routes:', n);
