import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription } from '../../../core/models/prescription.model';
import { SnackService } from '../../../core/services/snack.service';
import { PrintService } from '../../../core/services/print.service';
import { PrescriptionDialogComponent } from '../prescription-dialog/prescription-dialog.component';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.scss'
})
export class PrescriptionListComponent implements OnInit {
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  search = '';
  rows: Prescription[] = [];
  displayedColumns = ['prescriptionNo', 'patientName', 'status', 'actions'];
  columns = [{ key: 'prescriptionNo', labelKey: 'PRESCRIPTION.NO' }, { key: 'patientName', labelKey: 'APPOINTMENTS.PATIENT' }, { key: 'status', labelKey: 'COMMON.STATUS' }];

  constructor(private readonly svc: PrescriptionService, private readonly snack: SnackService, private readonly dialogs: RmsDialogService, private readonly print: PrintService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: Record<string, string | number> = {};
    if (this.search.trim()) params['q'] = this.search.trim();
    this.svc.list(this.page, this.size, params).subscribe({
      next: (res) => { this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onCreate(): void {
    this.dialogs.open(PrescriptionDialogComponent, { width: '520px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onPrint(row: Prescription): void {
    this.svc.getPrint(row.id).subscribe({
      next: (res) => { if (res.data) this.print.prescription(res.data as Parameters<PrintService['prescription']>[0]); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onDownloadPdf(row: Prescription): void {
    this.svc.downloadPdf(row.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${row.prescriptionNo ?? row.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.snack.error(e.message)
    });
  }
  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
