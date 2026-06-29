import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { ReportService } from '../../../core/services/report.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { SnackService } from '../../../core/services/snack.service';
import { chartValue } from '../../../core/models/dashboard.model';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports-dashboard', standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, TranslateModule, BaseChartDirective, MatButtonModule, MatProgressSpinnerModule, PageHeaderComponent, RmsIconBtnComponent, DateFieldComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss'
})
export class ReportsDashboardComponent implements OnInit {
  loading = true;
  exporting = false;
  summary: DashboardStats | null = null;
  topServices: { label: string; value: number }[] = [];
  dateFrom = this.daysAgo(29);
  dateTo = this.today();
  revenue: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: '#b48a40', label: '' }] };
  appointments: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], borderColor: '#1b3553', fill: false, label: '' }] };
  patients: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: ['#1b3553', '#b48a40'] }] };
  doctors: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: '#059669', label: '' }] };
  barOpts: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.2)' } }, x: { grid: { display: false } } }
  };
  lineOpts: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.2)' } }, x: { grid: { display: false } } }
  };
  donutOpts: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(private readonly reports: ReportService, private readonly i18n: I18nService, private readonly snack: SnackService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const revenueLabel = this.i18n.instant('DASHBOARD.REVENUE');
    const appointmentsLabel = this.i18n.instant('DASHBOARD.APPOINTMENTS');
    const doctorsLabel = this.i18n.instant('DASHBOARD.DOCTOR_PERFORMANCE');
    forkJoin({
      summary: this.reports.summary(),
      full: this.reports.full(),
      revenue: this.reports.revenue(),
      appointments: this.reports.appointments(),
      patients: this.reports.patients(),
      doctors: this.reports.doctors(this.dateFrom, this.dateTo)
    }).subscribe({
      next: ({ summary, full, revenue, appointments, patients, doctors }) => {
        const s = summary.data;
        if (s) {
          this.summary = {
            patientsToday: Number(s.patientsToday ?? 0),
            appointmentsToday: Number(s.appointmentsToday ?? 0),
            queueWaiting: Number(s.queueWaiting ?? 0),
            revenueToday: Number(s.revenueToday ?? 0),
            revenueMonth: Number(s.revenueMonth ?? 0)
          };
        }
        const fullData = full.data as { topServices?: { label: string; value?: number }[] } | undefined;
        this.topServices = (fullData?.topServices ?? []).map((p) => ({
          label: p.label,
          value: Number(p.value ?? 0)
        }));
        const rev = revenue.data ?? [];
        this.revenue = { labels: rev.map(p => p.label), datasets: [{ data: rev.map(chartValue), backgroundColor: '#2563eb', label: revenueLabel }] };
        const apt = appointments.data ?? [];
        this.appointments = { labels: apt.map(p => this.i18n.instant('STATUS.' + p.label) || p.label), datasets: [{ data: apt.map(chartValue), borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.12)', fill: true, tension: 0.35, label: appointmentsLabel }] };
        const pat = patients.data ?? [];
        this.patients = { labels: pat.map(p => this.patientLabel(p.label)), datasets: [{ data: pat.map(chartValue), backgroundColor: ['#1d4ed8', '#059669', '#7c3aed'] }] };
        this.applyDoctorsChart(doctors.data ?? [], doctorsLabel);
        this.loading = false;
      },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  reloadDoctors(): void {
    const doctorsLabel = this.i18n.instant('DASHBOARD.DOCTOR_PERFORMANCE');
    this.reports.doctors(this.dateFrom, this.dateTo).subscribe({
      next: (res) => this.applyDoctorsChart(res.data ?? [], doctorsLabel),
      error: (err) => this.snack.error(err.message)
    });
  }

  private applyDoctorsChart(points: { label: string; count?: number }[], label: string): void {
    this.doctors = { labels: points.map(p => p.label), datasets: [{ data: points.map(chartValue), backgroundColor: '#0d9488', label }] };
  }

  hasChartData(data: ChartConfiguration['data']): boolean {
    const values = data.datasets?.[0]?.data as number[] | undefined;
    return Array.isArray(values) && values.some(v => Number(v) > 0);
  }

  servicePercent(value: number): number {
    if (!this.topServices.length) return 0;
    const max = Math.max(...this.topServices.map(s => s.value), 1);
    return Math.round((value / max) * 100);
  }

  private patientLabel(key: string): string {
    if (key === 'total') return this.i18n.instant('REPORTS.TOTAL');
    if (key === 'active') return this.i18n.instant('REPORTS.ACTIVE');
    return key;
  }

  private today(): string { return new Date().toISOString().slice(0, 10); }
  private daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  exportCsv(): void {
    this.exporting = true;
    this.reports.downloadCsv().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clinic-report-${this.today()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
        this.snack.success('REPORTS.EXPORTED');
      },
      error: (e) => { this.snack.error(e.message); this.exporting = false; }
    });
  }
}
