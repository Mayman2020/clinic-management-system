import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { AppointmentDialogComponent } from '../../appointments/appointment-dialog/appointment-dialog.component';
import { CheckInResultDialogComponent } from '../../appointments/check-in-result-dialog/check-in-result-dialog.component';
import { QueueToken } from '../../../core/models/queue.model';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

interface CalDay { day: number; today?: boolean; muted?: boolean; }

@Component({
  selector: 'app-calendar-view', standalone: true,
  imports: [NgFor, NgIf, TranslateModule, MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule, MatProgressSpinnerModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe, RmsDatePipe, RmsIconBtnComponent],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {
  loading = false;
  rows: Appointment[] = [];
  monthLabel = '';
  calendarDays: CalDay[] = [];
  weekDays: string[] = [];

  constructor(
    private readonly svc: AppointmentService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService,
    private readonly confirm: ConfirmService,
    private readonly router: Router,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.buildMiniCalendar();
    this.load();
  }

  load(): void {
    this.loading = true;
    const from = new Date();
    from.setDate(1);
    const to = new Date(from);
    to.setMonth(to.getMonth() + 1);
    this.monthLabel = from.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    this.buildMiniCalendar(from);
    this.svc.getCalendar(from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)).subscribe({
      next: (res) => { this.rows = res.data ?? []; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  private buildMiniCalendar(base = new Date()): void {
    const now = new Date();
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: CalDay[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, muted: true });
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, today: d === now.getDate() && month === now.getMonth() && year === now.getFullYear() });
    }
    while (days.length < 35) days.push({ day: 0, muted: true });
    this.calendarDays = days.slice(0, 35);
    this.weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((_, i) =>
      this.i18n.formatDateTime(new Date(2024, 0, 7 + i), { weekday: 'short' })
    );
  }

  onReschedule(a: Appointment): void {
    this.dialogs.open(AppointmentDialogComponent, { width: '480px', data: { mode: 'reschedule', appointment: a } })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onConfirm(a: Appointment): void {
    this.svc.confirm(a.id).subscribe({ next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.load(); }, error: (e) => this.snack.error(e.message) });
  }

  onCancel(a: Appointment): void {
    this.confirm.confirm({ titleKey: 'COMMON.CONFIRM_TITLE', messageKey: 'APPOINTMENTS.CANCEL_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.svc.cancel(a.id).subscribe({ next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.load(); }, error: (e) => this.snack.error(e.message) });
    });
  }

  canCheckIn(a: Appointment): boolean {
    return a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && a.status !== 'NO_SHOW';
  }

  canConsult(a: Appointment): boolean {
    return a.status !== 'CANCELLED' && a.status !== 'NO_SHOW';
  }

  onCheckIn(a: Appointment): void {
    this.svc.checkIn(a.id).subscribe({
      next: (res) => {
        const data = res.data;
        if (data?.appointment && data?.queueToken) {
          this.dialogs.open(CheckInResultDialogComponent, {
            width: '400px',
            data: { appointment: data.appointment, queueToken: data.queueToken as QueueToken }
          }).afterClosed().subscribe(() => this.load());
        } else {
          this.snack.success('WORKFLOW.CHECKED_IN');
          this.load();
        }
      },
      error: (e) => this.snack.error(e.message)
    });
  }

  onStartConsultation(a: Appointment): void {
    void this.router.navigate(['/admin/consultation/new'], {
      queryParams: { patientId: a.patientId, doctorId: a.doctorId, appointmentId: a.id }
    });
  }
}
