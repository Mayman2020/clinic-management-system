import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { SnackService } from '../../../core/services/snack.service';
import { PrescriptionDialogComponent } from '../../prescription/prescription-dialog/prescription-dialog.component';
import { LabDialogComponent } from '../../lab/lab-dialog/lab-dialog.component';
import { RadiologyDialogComponent } from '../../radiology/radiology-dialog/radiology-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ListLoadController } from '../../../shared/utils/list-load.util';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-consultation-list', standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, RouterLink, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, HasPermissionDirective, TranslateKeyPipe, RmsDatePipe],
  templateUrl: './consultation-list.component.html',
  styleUrl: './consultation-list.component.scss'
})
export class ConsultationListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 10;
  total = 0;
  search = '';
  patientFilter?: number;
  rows: Consultation[] = [];
  displayedColumns = ['patientName', 'doctorName', 'diagnosis', 'status', 'createdAt', 'actions'];
  columns = [
    { key: 'patientName', labelKey: 'APPOINTMENTS.PATIENT' },
    { key: 'doctorName', labelKey: 'APPOINTMENTS.DOCTOR' },
    { key: 'diagnosis', labelKey: 'CONSULTATION.DIAGNOSIS' },
    { key: 'status', labelKey: 'COMMON.STATUS' },
    { key: 'createdAt', labelKey: 'COMMON.DATE' }
  ];

  constructor(
    private readonly svc: ConsultationService,
    private readonly snack: SnackService,
    private readonly route: ActivatedRoute,
    private readonly dialogs: RmsDialogService,
    private readonly confirm: ConfirmService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const pid = this.route.snapshot.queryParamMap.get('patientId');
    if (pid) this.patientFilter = +pid;
    this.load();
  }

  load(): void {
    this.listLoad.begin();
    if (this.patientFilter) {
      this.svc.getByPatient(this.patientFilter).subscribe({
        next: (r) => {
          this.rows = r.data ?? [];
          this.total = this.rows.length;
          this.listLoad.end();
        },
        error: (err) => {
          this.snack.error(err.message);
          this.listLoad.end();
        }
      });
      return;
    }
    this.svc.list(this.page, this.size, this.search).subscribe({
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

  onSearch(): void { this.page = 0; this.load(); }
  hasActiveFilters(): boolean { return !!this.search.trim() || !!this.patientFilter; }

  onPrescription(row: Consultation): void {
    this.dialogs.open(PrescriptionDialogComponent, {
      width: '520px',
      data: { patientId: row.patientId, doctorId: row.doctorId, consultationId: row.id }
    });
  }

  onLab(row: Consultation): void {
    this.dialogs.open(LabDialogComponent, { width: '520px', data: { patientId: row.patientId, doctorId: row.doctorId, consultationId: row.id } });
  }

  onRadiology(row: Consultation): void {
    this.dialogs.open(RadiologyDialogComponent, { width: '520px', data: { patientId: row.patientId, doctorId: row.doctorId, consultationId: row.id } });
  }

  onGenerateInvoice(row: Consultation): void {
    this.confirm.confirm({ titleKey: 'COMMON.CONFIRM_TITLE', messageKey: 'WORKFLOW.GENERATE_INVOICE_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.svc.generateInvoice(row.id).subscribe({
        next: () => { this.snack.success('WORKFLOW.INVOICE_CREATED'); this.router.navigate(['/admin/billing']); },
        error: (e) => this.snack.error(e.message)
      });
    });
  }

  onComplete(row: Consultation): void {
    this.svc.complete(row.id).subscribe({
      next: () => { this.snack.success('WORKFLOW.CONSULTATION_COMPLETED'); this.load(); },
      error: (e) => this.snack.error(e.message)
    });
  }

  isActive(row: Consultation): boolean {
    return row.status !== 'COMPLETED';
  }

  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
