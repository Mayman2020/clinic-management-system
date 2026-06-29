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
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';
import { SnackService } from '../../../core/services/snack.service';
import { DoctorDialogComponent } from '../doctor-dialog/doctor-dialog.component';
import { DoctorScheduleDialogComponent } from '../doctor-schedule-dialog/doctor-schedule-dialog.component';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, PageHeaderComponent, RmsIconBtnComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss'
})
export class DoctorListComponent implements OnInit {
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  search = '';
  rows: Doctor[] = [];
  displayedColumns = ['doctorCode', 'firstName', 'specialty', 'department', 'actions'];
  columns = [{ key: 'doctorCode', labelKey: 'DOCTORS.CODE' }, { key: 'firstName', labelKey: 'DOCTORS.NAME' }, { key: 'specialty', labelKey: 'DOCTORS.SPECIALTY' }, { key: 'department', labelKey: 'DOCTORS.DEPARTMENT' }];

  constructor(private readonly svc: DoctorService, private readonly snack: SnackService, private readonly dialogs: RmsDialogService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.page, this.size, this.search).subscribe({
      next: (res) => { this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onCreate(): void {
    this.dialogs.open(DoctorDialogComponent, { width: '520px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onEdit(row: Doctor): void {
    this.dialogs.open(DoctorDialogComponent, { width: '520px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onSchedule(row: Doctor): void {
    this.dialogs.open(DoctorScheduleDialogComponent, { width: '420px', data: row.id }).afterClosed().subscribe(() => {});
  }
  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
