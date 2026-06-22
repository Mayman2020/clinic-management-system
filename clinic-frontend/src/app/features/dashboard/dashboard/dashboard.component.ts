import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardStats, chartValue } from '../../../core/models/dashboard.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
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
  revenueChart: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: '', borderColor: '#b48a40', backgroundColor: 'rgba(180,138,64,0.15)', fill: true, tension: 0.35 }] };
  appointmentsChart: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: '', backgroundColor: '#1b3553' }] };
  lineOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  constructor(private readonly dash: DashboardService, private readonly snack: SnackService, private readonly i18n: I18nService) {}

  ngOnInit(): void {
    const revenueLabel = this.i18n.instant('DASHBOARD.REVENUE');
    const appointmentsLabel = this.i18n.instant('DASHBOARD.APPOINTMENTS');
    this.revenueChart.datasets[0].label = revenueLabel;
    this.appointmentsChart.datasets[0].label = appointmentsLabel;

    forkJoin({ stats: this.dash.getStats(), revenue: this.dash.getRevenueChart(), appointments: this.dash.getAppointmentsChart() }).subscribe({
      next: ({ stats, revenue, appointments }) => {
        const s = stats.data;
        if (s) {
          this.stats = {
            patientsToday: Number(s.patientsToday ?? 0),
            appointmentsToday: Number(s.appointmentsToday ?? 0),
            queueWaiting: Number(s.queueWaiting ?? 0),
            revenueToday: Number(s.revenueToday ?? 0),
            revenueMonth: Number(s.revenueMonth ?? 0)
          };
        }
        const rev = revenue.data ?? [];
        this.revenueChart = { labels: rev.map((p) => this.formatChartLabel(p.label)), datasets: [{ ...this.revenueChart.datasets[0], data: rev.map(chartValue), label: revenueLabel }] };
        const apt = appointments.data ?? [];
        this.appointmentsChart = { labels: apt.map((p) => this.i18n.instant('STATUS.' + p.label) || p.label), datasets: [{ ...this.appointmentsChart.datasets[0], data: apt.map(chartValue), label: appointmentsLabel }] };
        this.loading = false;
      },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  private formatChartLabel(label: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(label)) {
      return this.i18n.formatDateTime(label, { month: 'short', day: 'numeric' });
    }
    return label;
  }
}
