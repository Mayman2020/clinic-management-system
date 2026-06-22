import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ReportService } from '../../../core/services/report.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { SnackService } from '../../../core/services/snack.service';
import { chartValue } from '../../../core/models/dashboard.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports-dashboard', standalone: true,
  imports: [NgIf, FormsModule, TranslateModule, BaseChartDirective, MatFormFieldModule, MatInputModule, MatButtonModule, PageHeaderComponent],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss'
})
export class ReportsDashboardComponent implements OnInit {
  loading = true;
  dateFrom = this.daysAgo(29);
  dateTo = this.today();
  revenue: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: '#b48a40', label: '' }] };
  appointments: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], borderColor: '#1b3553', fill: false, label: '' }] };
  patients: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: ['#1b3553', '#b48a40'] }] };
  doctors: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: '#256866', label: '' }] };
  opts: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  constructor(private readonly reports: ReportService, private readonly i18n: I18nService, private readonly snack: SnackService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const revenueLabel = this.i18n.instant('DASHBOARD.REVENUE');
    const appointmentsLabel = this.i18n.instant('DASHBOARD.APPOINTMENTS');
    const doctorsLabel = this.i18n.instant('DASHBOARD.DOCTOR_PERFORMANCE');
    forkJoin({
      revenue: this.reports.revenue(),
      appointments: this.reports.appointments(),
      patients: this.reports.patients(),
      doctors: this.reports.doctors(this.dateFrom, this.dateTo)
    }).subscribe({
      next: ({ revenue, appointments, patients, doctors }) => {
        const rev = revenue.data ?? [];
        this.revenue = { labels: rev.map(p => p.label), datasets: [{ data: rev.map(chartValue), backgroundColor: '#b48a40', label: revenueLabel }] };
        const apt = appointments.data ?? [];
        this.appointments = { labels: apt.map(p => this.i18n.instant('STATUS.' + p.label) || p.label), datasets: [{ data: apt.map(chartValue), borderColor: '#1b3553', fill: false, label: appointmentsLabel }] };
        const pat = patients.data ?? [];
        this.patients = { labels: pat.map(p => this.patientLabel(p.label)), datasets: [{ data: pat.map(chartValue), backgroundColor: ['#1b3553', '#b48a40', '#256866'] }] };
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
    this.doctors = { labels: points.map(p => p.label), datasets: [{ data: points.map(chartValue), backgroundColor: '#256866', label }] };
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
}
