import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [NgIf, RouterLink, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.scss'
})
export class AppointmentDetailComponent implements OnInit {
  loading = true;
  appt: Appointment | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly appointments: AppointmentService,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.appointments.getById(id).subscribe({
      next: (r) => { this.appt = r.data ?? null; this.loading = false; },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  formatDate(d: string): string {
    return this.i18n.formatDateTime(d, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  confirm(): void {
    if (!this.appt) return;
    this.appointments.confirm(this.appt.id).subscribe({
      next: (r) => { this.appt = r.data ?? this.appt; this.snack.success(this.i18n.instant('COMMON.SAVED')); },
      error: (e) => this.snack.error(e.message)
    });
  }

  checkIn(): void {
    if (!this.appt) return;
    this.appointments.checkIn(this.appt.id).subscribe({
      next: (r) => { this.appt = r.data?.appointment ?? this.appt; this.snack.success(this.i18n.instant('APPOINTMENTS.CHECKED_IN')); },
      error: (e) => this.snack.error(e.message)
    });
  }

  cancel(): void {
    if (!this.appt) return;
    this.appointments.cancel(this.appt.id).subscribe({
      next: (r) => { this.appt = r.data ?? this.appt; this.snack.success(this.i18n.instant('COMMON.SAVED')); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
