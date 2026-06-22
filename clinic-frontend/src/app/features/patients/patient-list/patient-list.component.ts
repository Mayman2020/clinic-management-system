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
import { PatientService } from '../../../core/services/patient.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Patient } from '../../../core/models/patient.model';
import { SnackService } from '../../../core/services/snack.service';
import { PatientDialogComponent } from '../patient-dialog/patient-dialog.component';
import { PatientHistoryDialogComponent } from '../patient-history-dialog/patient-history-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, MatDialogModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  loading = false;
  search = '';
  page = 0;
  size = 10;
  total = 0;
  rows: Patient[] = [];
  displayedColumns = ['patientCode', 'firstName', 'lastName', 'phone', 'gender', 'actions'];
  columns = [
    { key: 'patientCode', labelKey: 'PATIENTS.CODE' },
    { key: 'firstName', labelKey: 'PATIENTS.NAME' },
    { key: 'lastName', labelKey: 'PATIENTS.LAST_NAME' },
    { key: 'phone', labelKey: 'PATIENTS.PHONE' },
    { key: 'gender', labelKey: 'PATIENTS.GENDER', translate: 'GENDER' }
  ];

  constructor(
    private readonly svc: PatientService,
    private readonly snack: SnackService,
    private readonly dialog: MatDialog,
    private readonly confirm: ConfirmService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.page, this.size, this.search).subscribe({
      next: (res) => {
        this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0;
        this.loading = false;
      },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }

  onCreate(): void {
    this.dialog.open(PatientDialogComponent, { width: '560px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onEdit(row: Patient): void {
    this.dialog.open(PatientDialogComponent, { width: '560px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onHistory(row: Patient): void {
    this.dialog.open(PatientHistoryDialogComponent, { width: '640px', data: row });
  }

  onArchive(row: Patient): void {
    this.confirm.confirm({ titleKey: 'COMMON.CONFIRM_TITLE', messageKey: 'PATIENTS.ARCHIVE_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.svc.archive(row.id).subscribe({
        next: () => { this.snack.success('MESSAGES.ARCHIVED'); this.load(); },
        error: (err) => this.snack.error(err.message)
      });
    });
  }
}
