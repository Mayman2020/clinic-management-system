import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { SnackService } from '../../../core/services/snack.service';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, MatDialogModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent implements OnInit {
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  search = '';
  rows: Appointment[] = [];
  displayedColumns = ['appointmentNo', 'patientName', 'doctorName', 'status', 'actions'];
  columns = [{ key: 'appointmentNo', labelKey: 'APPOINTMENTS.NO' }, { key: 'patientName', labelKey: 'APPOINTMENTS.PATIENT' }, { key: 'doctorName', labelKey: 'APPOINTMENTS.DOCTOR' }, { key: 'status', labelKey: 'COMMON.STATUS' }];

  constructor(private readonly svc: AppointmentService, private readonly snack: SnackService, private readonly dialog: MatDialog, private readonly confirm: ConfirmService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: Record<string, string | number> = {};
    if (this.search) params['q'] = this.search;
    this.svc.list(this.page, this.size, params).subscribe({
      next: (res) => { this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onCreate(): void {
    this.dialog.open(AppointmentDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onWalkIn(): void {
    this.dialog.open(AppointmentDialogComponent, { width: '480px', data: { mode: 'walkin' } }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onReschedule(row: Appointment): void {
    this.dialog.open(AppointmentDialogComponent, { width: '480px', data: { mode: 'reschedule', appointment: row } }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
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
  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
}
