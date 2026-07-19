import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { InlineStateComponent } from '../../../shared/components/inline-state/inline-state.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { SnackService } from '../../../core/services/snack.service';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { CheckInResultDialogComponent } from '../check-in-result-dialog/check-in-result-dialog.component';
import { QueueToken } from '../../../core/models/queue.model';
import { ListLoadController } from '../../../shared/utils/list-load.util';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, InlineStateComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 10;
  total = 0;
  search = '';
  statusFilter = '';
  rows: Appointment[] = [];
  displayedColumns = ['appointmentNo', 'patientName', 'doctorName', 'status', 'actions'];
  columns = [{ key: 'appointmentNo', labelKey: 'APPOINTMENTS.NO' }, { key: 'patientName', labelKey: 'APPOINTMENTS.PATIENT' }, { key: 'doctorName', labelKey: 'APPOINTMENTS.DOCTOR' }, { key: 'status', labelKey: 'COMMON.STATUS' }];
  statusOptions = ['SCHEDULED', 'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

  constructor(
    private readonly svc: AppointmentService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService,
    private readonly confirm: ConfirmService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    const params: Record<string, string | number> = {};
    if (this.search) params['q'] = this.search;
    if (this.statusFilter) params['status'] = this.statusFilter;
    this.svc.list(this.page, this.size, params).subscribe({
      next: (res) => {
        this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0;
        this.listLoad.end();
      },
      error: (err) => {
        this.snack.error(err.message);
        this.rows = [];
        this.total = 0;
        this.listLoad.end();
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.load();
  }

  onFilterChange(): void {
    this.page = 0;
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(this.search.trim() || this.statusFilter);
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.page = 0;
    this.load();
  }

  onCreate(): void {
    this.dialogs.open(AppointmentDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onWalkIn(): void {
    this.dialogs.open(AppointmentDialogComponent, { width: '480px', data: { mode: 'walkin' } }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onReschedule(row: Appointment): void {
    this.dialogs.open(AppointmentDialogComponent, { width: '480px', data: { mode: 'reschedule', appointment: row } }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onConfirm(row: Appointment): void {
    this.svc.confirm(row.id).subscribe({ next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.load(); }, error: (e) => this.snack.error(e.message) });
  }

  onCancel(row: Appointment): void {
    this.confirm.confirm({ titleKey: 'COMMON.CONFIRM_TITLE', messageKey: 'APPOINTMENTS.CANCEL_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.svc.cancel(row.id).subscribe({ next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.load(); }, error: (e) => this.snack.error(e.message) });
    });
  }

  onCheckIn(row: Appointment): void {
    this.svc.checkIn(row.id).subscribe({
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

  onStartConsultation(row: Appointment): void {
    this.router.navigate(['/admin/consultation/new'], {
      queryParams: { patientId: row.patientId, doctorId: row.doctorId, appointmentId: row.id }
    });
  }

  onSendReminder(row: Appointment): void {
    this.svc.sendReminder(row.id).subscribe({
      next: () => this.snack.success('WORKFLOW.REMINDER_SENT'),
      error: (e) => this.snack.error(e.message)
    });
  }

  canRemind(row: Appointment): boolean {
    return row.status === 'SCHEDULED' || row.status === 'CONFIRMED';
  }

  canCheckIn(row: Appointment): boolean {
    return row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && row.status !== 'NO_SHOW';
  }

  canConsult(row: Appointment): boolean {
    return row.status !== 'CANCELLED' && row.status !== 'NO_SHOW';
  }

  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
