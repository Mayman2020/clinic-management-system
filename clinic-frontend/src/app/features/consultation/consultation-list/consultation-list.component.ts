import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-consultation-list', standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, RouterLink, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './consultation-list.component.html',
  styleUrl: './consultation-list.component.scss'
})
export class ConsultationListComponent implements OnInit {
  loading = false;
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
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const pid = this.route.snapshot.queryParamMap.get('patientId');
    if (pid) this.patientFilter = +pid;
    this.load();
  }

  load(): void {
    this.loading = true;
    if (this.patientFilter) {
      this.svc.getByPatient(this.patientFilter).subscribe({
        next: (r) => { this.rows = r.data ?? []; this.total = this.rows.length; this.loading = false; },
        error: (err) => { this.snack.error(err.message); this.loading = false; }
      });
      return;
    }
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
}
