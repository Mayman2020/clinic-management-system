import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { Patient } from '../../../core/models/patient.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-patient-history-dialog', standalone: true,
  imports: [NgFor, NgIf, MatDialogModule, MatButtonModule, TranslateModule, TranslateKeyPipe],
  template: `
    <h2 mat-dialog-title>{{ 'PATIENTS.CONSULTATION_HISTORY' | translate }} — {{ patient.firstName }} {{ patient.lastName }}</h2>
    <mat-dialog-content>
      <div class="history-row" *ngFor="let c of rows">
        <div class="date">{{ c.createdAt }}</div>
        <div class="body">
          <strong>{{ c.diagnosis || ('COMMON.UNKNOWN' | translate) }}</strong>
          <div class="meta">{{ c.doctorName }} · {{ c.status | tk:'STATUS' }}</div>
          <p *ngIf="c.symptoms">{{ c.symptoms }}</p>
        </div>
      </div>
      <p *ngIf="!loading && !rows.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
      <p *ngIf="loading">{{ 'COMMON.LOADING' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'COMMON.CLOSE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.history-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); } .date { min-width: 120px; color: var(--muted); font-size: 13px; } .meta { color: var(--muted); font-size: 13px; }`]
})
export class PatientHistoryDialogComponent implements OnInit {
  rows: Consultation[] = [];
  loading = true;

  constructor(
    private readonly svc: ConsultationService,
    private readonly snack: SnackService,
    @Inject(MAT_DIALOG_DATA) public patient: Patient
  ) {}

  ngOnInit(): void {
    this.svc.getByPatient(this.patient.id).subscribe({
      next: (r) => { this.rows = r.data ?? []; this.loading = false; },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }
}
