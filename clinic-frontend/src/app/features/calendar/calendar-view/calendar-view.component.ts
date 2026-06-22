import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Appointment } from '../../../core/models/appointment.model';
import { SnackService } from '../../../core/services/snack.service';
import { AppointmentDialogComponent } from '../../appointments/appointment-dialog/appointment-dialog.component';

@Component({
  selector: 'app-calendar-view', standalone: true,
  imports: [NgFor, NgIf, DatePipe, TranslateModule, MatButtonModule, MatIconModule, MatDialogModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {
  loading = false;
  rows: Appointment[] = [];
  monthLabel = '';

  constructor(
    private readonly svc: AppointmentService,
    private readonly snack: SnackService,
    private readonly dialog: MatDialog,
    private readonly confirm: ConfirmService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const from = new Date();
    from.setDate(1);
    const to = new Date(from);
    to.setMonth(to.getMonth() + 1);
    this.monthLabel = from.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    this.svc.getCalendar(from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)).subscribe({
      next: (res) => { this.rows = res.data ?? []; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onReschedule(a: Appointment): void {
    this.dialog.open(AppointmentDialogComponent, { width: '480px', data: { mode: 'reschedule', appointment: a } })
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
}
