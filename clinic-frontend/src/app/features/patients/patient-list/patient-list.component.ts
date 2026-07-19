import { Component, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { InlineStateComponent } from '../../../shared/components/inline-state/inline-state.component';
import { TableExportToolbarComponent, ExportColumn } from '../../../shared/components/table-export-toolbar/table-export-toolbar.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { PatientService } from '../../../core/services/patient.service';
import { DeleteConfirmService } from '../../../core/services/delete-confirm.service';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { Patient } from '../../../core/models/patient.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PatientDialogComponent } from '../patient-dialog/patient-dialog.component';
import { PatientHistoryDialogComponent } from '../patient-history-dialog/patient-history-dialog.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [MatTooltipModule, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, RouterLink, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent, TablePagerComponent, RmsIconBtnComponent, EmptyStateComponent, InlineStateComponent, TableExportToolbarComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  listLoad = new ListLoadController();
  search = '';
  activeFilter = '';
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
    private readonly dialogs: RmsDialogService,
    private readonly deleteConfirm: DeleteConfirmService,
    private readonly i18n: I18nService
  ) {}

  get exportColumns(): ExportColumn<Patient>[] {
    return [
      { header: this.i18n.instant('PATIENTS.CODE'), value: 'patientCode' },
      { header: this.i18n.instant('PATIENTS.NAME'), value: 'firstName' },
      { header: this.i18n.instant('PATIENTS.LAST_NAME'), value: 'lastName' },
      { header: this.i18n.instant('PATIENTS.PHONE'), value: (row) => row.phone ?? '-' },
      {
        header: this.i18n.instant('PATIENTS.GENDER'),
        value: (row) => row.gender ? this.i18n.instant(`GENDER.${row.gender}`) : '-'
      }
    ];
  }

  loadExportRows = (): Promise<Patient[]> => {
    const active = this.activeFilter === '' ? undefined : this.activeFilter === 'true';
    return firstValueFrom(this.svc.list(0, 10000, this.search, active)).then(
      (res) => res.data?.content ?? []
    );
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    const active = this.activeFilter === '' ? undefined : this.activeFilter === 'true';
    this.svc.list(this.page, this.size, this.search, active).subscribe({
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

  onPageIndexChange(index: number): void {
    this.page = index;
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(this.search.trim() || this.activeFilter);
  }

  clearFilters(): void {
    this.search = '';
    this.activeFilter = '';
    this.page = 0;
    this.load();
  }

  onCreate(): void {
    this.dialogs.open(PatientDialogComponent, { width: '560px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onEdit(row: Patient): void {
    this.dialogs.open(PatientDialogComponent, { width: '560px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onHistory(row: Patient): void {
    this.dialogs.open(PatientHistoryDialogComponent, { width: '640px', data: row });
  }

  onArchive(row: Patient): void {
    this.deleteConfirm.openDeleteConfirm({ messageKey: 'PATIENTS.ARCHIVE_CONFIRM', confirmLabelKey: 'COMMON.ARCHIVE' }).subscribe((ok) => {
      if (!ok) return;
      this.svc.archive(row.id).subscribe({
        next: () => { this.snack.success('MESSAGES.ARCHIVED'); this.load(); },
        error: (err) => this.snack.error(err.message)
      });
    });
  }
}
