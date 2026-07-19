import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { StatCardComponent, StatCardVariant } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BranchService } from '../../../core/services/branch.service';
import { DashboardStats, chartValue, ChartPoint } from '../../../core/models/dashboard.model';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { forkJoin, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, skip } from 'rxjs/operators';

interface QuickLink { icon: string; labelKey: string; route: string; }
interface StatCard { labelKey: string; value: number | string; icon: string; variant: StatCardVariant; subtitleKey?: string; }
interface UpcomingAppt { id: number; time: string; date: string; patientName: string; patientInitials: string; doctorName: string; doctorInitials: string; status: string; }
interface CalDay { day: number; today?: boolean; muted?: boolean; }
interface NotifItem { icon: string; type: string; title: string; message: string; time: string; }

@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [NgFor, NgIf, RouterLink, TranslateModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, BaseChartDirective, StatCardComponent, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  stats: DashboardStats | null = null;
  statCards: StatCard[] = [];
  quickLinks: QuickLink[] = [];
  upcomingAppointments: UpcomingAppt[] = [];
  calendarDays: CalDay[] = [];
  currentMonth = '';
  notifications: NotifItem[] = [];
  welcomeKey = 'DASHBOARD.TITLE';
  welcomeParams: Record<string, string> = {};
  heroIllustration = 'assets/illustrations/medical-dashboard.svg';
  showCharts = true;
  private branchSub?: Subscription;
  private role: UserRole | null = null;
  private revenueLabel = '';
  private appointmentsLabel = '';

  revenueChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: '', borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.12)', fill: true, tension: 0.35 }] };
  appointmentsChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: '', backgroundColor: '#10b981' }] };
  lineOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  constructor(
    private readonly dash: DashboardService,
    private readonly appointments: AppointmentService,
    private readonly branchService: BranchService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly auth: AuthService,
    private readonly notificationsSvc: NotificationService
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.quickLinks = this.buildQuickLinks(this.role);
    this.welcomeKey = this.resolveWelcomeKey(this.role);
    this.welcomeParams = { name: this.auth.getCurrentUser()?.fullName?.split(' ')[0] || '' };
    this.heroIllustration = this.buildHeroIllustration(this.role);
    this.showCharts = this.role === 'ADMIN' || this.role === 'CASHIER';
    this.buildCalendar();
    this.loadNotifications();

    this.revenueLabel = this.i18n.instant('DASHBOARD.REVENUE');
    this.appointmentsLabel = this.i18n.instant('DASHBOARD.APPOINTMENTS');
    this.revenueChart.datasets[0].label = this.revenueLabel;
    this.appointmentsChart.datasets[0].label = this.appointmentsLabel;

    this.loadDashboardData();
    this.branchSub = this.branchService.observeContext().pipe(
      filter((ctx) => ctx != null),
      distinctUntilChanged((a, b) => a!.currentBranchId === b!.currentBranchId),
      skip(1)
    ).subscribe(() => this.loadDashboardData());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  private loadDashboardData(): void {
    this.loading = true;
    const branchId = this.branchService.currentBranchId ?? undefined;
    if (this.showCharts) {
      forkJoin({
        stats: this.dash.getStats(branchId),
        appts: this.appointments.list(0, 8, { statuses: ['SCHEDULED', 'CONFIRMED'] }),
        revenue: this.dash.getRevenueChart(branchId),
        appointments: this.dash.getAppointmentsChart(branchId)
      }).subscribe({
        next: (res) => this.handleDashboardData(res),
        error: (err) => { this.snack.error(err.message); this.loading = false; }
      });
    } else {
      forkJoin({
        stats: this.dash.getStats(branchId),
        appts: this.appointments.list(0, 8, { statuses: ['SCHEDULED', 'CONFIRMED'] }),
      }).subscribe({
        next: (res) => this.handleDashboardData(res),
        error: (err) => { this.snack.error(err.message); this.loading = false; }
      });
    }
  }

  private handleDashboardData(
    res: {
      stats: ApiResponse<DashboardStats>;
      appts: ApiResponse<PagedResponse<Appointment>>;
      revenue?: ApiResponse<ChartPoint[]>;
      appointments?: ApiResponse<ChartPoint[]>;
    }
  ): void {
    const statsRes = res.stats;
    const s = statsRes.data;
    if (s) {
      this.stats = {
        patientsToday: Number(s.patientsToday ?? 0),
        appointmentsToday: Number(s.appointmentsToday ?? 0),
        queueWaiting: Number(s.queueWaiting ?? 0),
        revenueToday: Number(s.revenueToday ?? 0),
        revenueMonth: Number(s.revenueMonth ?? 0)
      };
    }
    this.statCards = this.buildStatCards(this.role, this.stats);

    const apptRes = res.appts;
    this.upcomingAppointments = (apptRes.data?.content ?? []).map((a) => ({
      id: a.id,
      time: this.i18n.formatDateTime(a.startTime || a.appointmentDate, { hour: '2-digit', minute: '2-digit' }),
      date: this.i18n.formatDateTime(a.appointmentDate, { month: 'short', day: 'numeric', year: 'numeric' }),
      patientName: a.patientName || `#${a.id}`,
      patientInitials: this.initials(a.patientName || 'P'),
      doctorName: a.doctorName || '-',
      doctorInitials: this.initials(a.doctorName || 'D'),
      status: a.status
    }));

    if (res.revenue && res.appointments) {
      const rev = res.revenue.data ?? [];
      this.revenueChart = { labels: rev.map((p) => this.formatChartLabel(p.label)), datasets: [{ ...this.revenueChart.datasets[0], data: rev.map(chartValue), label: this.revenueLabel }] };
      const aptData = res.appointments.data ?? [];
      this.appointmentsChart = { labels: aptData.map((p) => this.i18n.instant('STATUS.' + p.label) || p.label), datasets: [{ ...this.appointmentsChart.datasets[0], data: aptData.map(chartValue), label: this.appointmentsLabel }] };
    }
    this.loading = false;
  }

  private resolveWelcomeKey(role: UserRole | null): string {
    const keys: Record<string, string> = {
      ADMIN: 'DASHBOARD.WELCOME_ADMIN',
      DOCTOR: 'DASHBOARD.WELCOME_DOCTOR',
      RECEPTIONIST: 'DASHBOARD.WELCOME_RECEPTIONIST',
      NURSE: 'DASHBOARD.WELCOME_NURSE',
      CASHIER: 'DASHBOARD.WELCOME_CASHIER'
    };
    return role ? (keys[role] || 'DASHBOARD.TITLE') : 'DASHBOARD.TITLE';
  }

  private buildHeroIllustration(role: UserRole | null): string {
    const map: Partial<Record<UserRole, string>> = {
      DOCTOR: 'assets/illustrations/doctor-tablet.svg',
      RECEPTIONIST: 'assets/illustrations/clinic-reception.svg',
      ADMIN: 'assets/illustrations/medical-dashboard.svg'
    };
    return role && map[role] ? map[role]! : 'assets/illustrations/medical-dashboard.svg';
  }

  private buildStatCards(role: UserRole | null, stats: DashboardStats | null): StatCard[] {
    const n = (v?: number) => Number(v ?? 0);
    const s = stats ?? { patientsToday: 0, appointmentsToday: 0, queueWaiting: 0, revenueToday: 0, revenueMonth: 0 };
    if (role === 'DOCTOR') {
      return [
        { labelKey: 'DASHBOARD.APPOINTMENTS', value: n(s.appointmentsToday), icon: 'event', variant: 'blue' },
        { labelKey: 'DASHBOARD.PATIENTS_TODAY', value: n(s.patientsToday), icon: 'groups', variant: 'green' },
        { labelKey: 'DASHBOARD.QUEUE_WAITING', value: n(s.queueWaiting), icon: 'queue', variant: 'orange' }
      ];
    }
    if (role === 'RECEPTIONIST') {
      return [
        { labelKey: 'DASHBOARD.APPOINTMENTS', value: n(s.appointmentsToday), icon: 'event', variant: 'blue' },
        { labelKey: 'DASHBOARD.PATIENTS_TODAY', value: n(s.patientsToday), icon: 'groups', variant: 'green' },
        { labelKey: 'DASHBOARD.QUEUE_WAITING', value: n(s.queueWaiting), icon: 'queue', variant: 'orange' },
        { labelKey: 'DASHBOARD.COMPLETED_TODAY', value: Math.max(0, n(s.appointmentsToday) - n(s.queueWaiting)), icon: 'check_circle', variant: 'green' }
      ];
    }
    return [
      { labelKey: 'DASHBOARD.APPOINTMENTS', value: n(s.appointmentsToday), icon: 'event', variant: 'blue' },
      { labelKey: 'DASHBOARD.PATIENTS_TODAY', value: n(s.patientsToday), icon: 'groups', variant: 'green' },
      { labelKey: 'DASHBOARD.QUEUE_WAITING', value: n(s.queueWaiting), icon: 'queue', variant: 'orange' },
      { labelKey: 'DASHBOARD.DAILY_REVENUE', value: n(s.revenueToday), icon: 'payments', variant: 'purple', subtitleKey: 'DASHBOARD.TODAY' }
    ];
  }

  private buildCalendar(): void {
    const now = new Date();
    this.currentMonth = this.i18n.formatDateTime(now, { month: 'long', year: 'numeric' });
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalDay[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, muted: true });
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, today: d === now.getDate() });
    }
    this.calendarDays = days.filter((x) => x.day > 0 || x.muted);
    while (this.calendarDays.length < 35) {
      this.calendarDays.push({ day: 0, muted: true });
    }
    this.calendarDays = this.calendarDays.slice(0, 35).map((x) => x.day === 0 && !x.muted ? { day: 0, muted: true } : x);
  }

  private loadNotifications(): void {
    this.notificationsSvc.list(0, 5).subscribe({
      next: (r) => {
        const rows = (r.data?.content ?? []).map((n) => ({
          icon: this.notifIcon(n.type),
          type: (n.type || 'bell').toLowerCase(),
          title: this.i18n.instant(n.titleKey, this.parseVars(n.varsJson)),
          message: this.i18n.instant(n.bodyKey, this.parseVars(n.varsJson)),
          time: this.i18n.formatDateTime(n.createdAt)
        }));
        this.notifications = rows.length ? rows : this.buildFallbackNotifications();
      },
      error: () => { this.notifications = this.buildFallbackNotifications(); }
    });
  }

  private buildFallbackNotifications(): NotifItem[] {
    const role = this.role;
    if (role === 'DOCTOR') {
      return [
        { icon: 'event', type: 'appointment', title: this.i18n.instant('DASHBOARD.TODAY_APPOINTMENTS'), message: this.i18n.instant('DASHBOARD.NO_APPOINTMENTS_HINT'), time: this.i18n.instant('COMMON.JUST_NOW') },
        { icon: 'science', type: 'lab', title: this.i18n.instant('NAV.LAB'), message: this.i18n.instant('DASHBOARD.CHECK_LAB_RESULTS'), time: this.i18n.instant('COMMON.TODAY') }
      ];
    }
    if (role === 'RECEPTIONIST') {
      return [
        { icon: 'event', type: 'appointment', title: this.i18n.instant('DASHBOARD.CHECK_IN_QUEUE'), message: this.i18n.instant('DASHBOARD.CHECK_IN_QUEUE_HINT'), time: this.i18n.instant('COMMON.TODAY') },
        { icon: 'groups', type: 'patient', title: this.i18n.instant('DASHBOARD.NEW_PATIENTS'), message: this.i18n.instant('DASHBOARD.NEW_PATIENTS_HINT'), time: this.i18n.instant('COMMON.TODAY') }
      ];
    }
    return [
      { icon: 'event', type: 'appointment', title: this.i18n.instant('DASHBOARD.TODAY_APPOINTMENTS'), message: this.i18n.instant('DASHBOARD.NO_APPOINTMENTS_HINT'), time: this.i18n.instant('COMMON.TODAY') },
      { icon: 'receipt_long', type: 'invoice', title: this.i18n.instant('NAV.BILLING'), message: this.i18n.instant('DASHBOARD.REVIEW_BILLING'), time: this.i18n.instant('COMMON.TODAY') }
    ];
  }

  private parseVars(varsJson?: string): Record<string, string> {
    if (!varsJson) return {};
    try { return JSON.parse(varsJson); } catch { return {}; }
  }

  private notifIcon(type: string): string {
    const map: Record<string, string> = {
      Appointment: 'event', LabRequest: 'science', Consultation: 'assignment',
      Invoice: 'receipt_long', RadiologyRequest: 'biotech'
    };
    return map[type] || 'notifications';
  }

  private initials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
  }

  hasChartData(data: ChartConfiguration['data']): boolean {
    const values = data.datasets?.[0]?.data as number[] | undefined;
    return Array.isArray(values) && values.some((v) => Number(v) > 0);
  }

  private formatChartLabel(label: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(label)) {
      return this.i18n.formatDateTime(label, { month: 'short', day: 'numeric' });
    }
    return label;
  }

  private buildQuickLinks(role: UserRole | null): QuickLink[] {
    const all: Record<UserRole, QuickLink[]> = {
      ADMIN: [
        { icon: 'person_add', labelKey: 'DASHBOARD.ACTION_NEW_PATIENT', route: '/admin/patients' },
        { icon: 'event', labelKey: 'DASHBOARD.ACTION_BOOK_APPT', route: '/admin/appointments' },
        { icon: 'videocam', labelKey: 'LOGIN.FEATURE_CONSULT', route: '/admin/consultation' },
        { icon: 'receipt_long', labelKey: 'NAV.BILLING', route: '/admin/billing' },
        { icon: 'bar_chart', labelKey: 'NAV.REPORTS', route: '/admin/reports' }
      ],
      RECEPTIONIST: [
        { icon: 'event', labelKey: 'DASHBOARD.ACTION_BOOK_APPT', route: '/admin/appointments' },
        { icon: 'desk', labelKey: 'NAV.RECEPTION', route: '/admin/reception' },
        { icon: 'person_add', labelKey: 'DASHBOARD.ACTION_NEW_PATIENT', route: '/admin/patients' },
        { icon: 'queue', labelKey: 'NAV.QUEUE', route: '/admin/queue' },
        { icon: 'campaign', labelKey: 'DASHBOARD.CHECK_IN_QUEUE', route: '/admin/queue' }
      ],
      DOCTOR: [
        { icon: 'assignment', labelKey: 'NAV.CONSULTATION', route: '/admin/consultation' },
        { icon: 'medication', labelKey: 'NAV.PRESCRIPTION', route: '/admin/prescription' },
        { icon: 'groups', labelKey: 'NAV.PATIENTS', route: '/admin/patients' },
        { icon: 'science', labelKey: 'NAV.LAB', route: '/admin/lab' },
        { icon: 'receipt_long', labelKey: 'NAV.BILLING', route: '/admin/billing' }
      ],
      NURSE: [
        { icon: 'queue', labelKey: 'NAV.QUEUE', route: '/admin/queue' },
        { icon: 'groups', labelKey: 'NAV.PATIENTS', route: '/admin/patients' }
      ],
      CASHIER: [
        { icon: 'receipt_long', labelKey: 'NAV.BILLING', route: '/admin/billing' },
        { icon: 'payments', labelKey: 'BILLING.PAYMENTS', route: '/admin/billing/payments' }
      ],
      LAB_TECHNICIAN: [{ icon: 'science', labelKey: 'NAV.LAB', route: '/admin/lab' }],
      RADIOLOGY_STAFF: [{ icon: 'biotech', labelKey: 'NAV.RADIOLOGY', route: '/admin/radiology' }]
    };
    return role ? (all[role] ?? []) : [];
  }
}
