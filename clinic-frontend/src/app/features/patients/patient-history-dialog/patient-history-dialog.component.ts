import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { LabService } from '../../../core/services/lab.service';
import { BillingService } from '../../../core/services/billing.service';
import { Consultation } from '../../../core/models/consultation.model';
import { Appointment } from '../../../core/models/appointment.model';
import { Patient } from '../../../core/models/patient.model';
import { SnackService } from '../../../core/services/snack.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-patient-history-dialog', standalone: true,
  imports: [NgFor, NgIf, MatDialogModule, MatButtonModule, MatTabsModule, TranslateModule, TranslateKeyPipe],
  template: `
    <h2 mat-dialog-title>{{ 'PATIENTS.FULL_HISTORY' | translate }} — {{ patient.firstName }} {{ patient.lastName }}</h2>
    <mat-dialog-content class="patient-timeline">
      <mat-tab-group>
        <mat-tab [label]="'CONSULTATION.TITLE' | translate">
          <div class="history-row" *ngFor="let c of consultations">
            <div class="date">{{ c.createdAt }}</div>
            <div class="body">
              <strong>{{ c.diagnosis || ('COMMON.UNKNOWN' | translate) }}</strong>
              <div class="meta">{{ c.doctorName }} · {{ c.status | tk:'STATUS' }}</div>
              <p *ngIf="c.symptoms">{{ c.symptoms }}</p>
            </div>
          </div>
          <p *ngIf="!loading && !consultations.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
        </mat-tab>
        <mat-tab [label]="'APPOINTMENTS.TITLE' | translate">
          <div class="history-row" *ngFor="let a of appointments">
            <div class="date">{{ a.appointmentDate }}</div>
            <div class="body">
              <strong>{{ a.appointmentNo }}</strong>
              <div class="meta">{{ a.doctorName }} · {{ a.status | tk:'STATUS' }}</div>
            </div>
          </div>
          <p *ngIf="!loading && !appointments.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
        </mat-tab>
        <mat-tab [label]="'LAB.TITLE' | translate">
          <div class="history-row" *ngFor="let l of labRequests">
            <div class="date">{{ l.requestedAt || l.createdAt }}</div>
            <div class="body">
              <strong>{{ l.testType }}</strong>
              <div class="meta">{{ l.requestNo }} · {{ l.status | tk:'STATUS' }}</div>
            </div>
          </div>
          <p *ngIf="!loading && !labRequests.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
        </mat-tab>
        <mat-tab [label]="'BILLING.TITLE' | translate">
          <div class="history-row" *ngFor="let inv of invoices">
            <div class="date">{{ inv.createdAt }}</div>
            <div class="body">
              <strong>{{ inv.invoiceNo }}</strong>
              <div class="meta">{{ inv.total }} · {{ inv.status | tk:'STATUS' }}</div>
            </div>
          </div>
          <p *ngIf="!loading && !invoices.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
        </mat-tab>
      </mat-tab-group>
      <p *ngIf="loading" class="loading-state">{{ 'COMMON.LOADING' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'COMMON.CLOSE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .patient-timeline { min-width: 560px; min-height: 320px; }
    .history-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border, var(--line)); }
    .date { min-width: 120px; color: var(--muted, var(--text-muted)); font-size: 13px; }
    .meta { color: var(--muted, var(--text-muted)); font-size: 13px; }
    .empty-state, .loading-state { padding: 16px; color: var(--text-muted); }
  `]
})
export class PatientHistoryDialogComponent implements OnInit {
  consultations: Consultation[] = [];
  appointments: Appointment[] = [];
  labRequests: { requestNo: string; testType: string; status: string; requestedAt?: string; createdAt?: string }[] = [];
  invoices: { invoiceNo: string; total: number; status: string; createdAt?: string }[] = [];
  loading = true;

  constructor(
    private readonly consultationSvc: ConsultationService,
    private readonly appointmentSvc: AppointmentService,
    private readonly labSvc: LabService,
    private readonly billingSvc: BillingService,
    private readonly snack: SnackService,
    @Inject(MAT_DIALOG_DATA) public patient: Patient
  ) {}

  ngOnInit(): void {
    forkJoin({
      consultations: this.consultationSvc.getByPatient(this.patient.id),
      appointments: this.appointmentSvc.getByPatient(this.patient.id),
      lab: this.labSvc.getByPatient(this.patient.id),
      billing: this.billingSvc.getByPatient(this.patient.id)
    }).subscribe({
      next: ({ consultations, appointments, lab, billing }) => {
        this.consultations = consultations.data ?? [];
        this.appointments = appointments.data ?? [];
        this.labRequests = lab.data ?? [];
        this.invoices = billing.data?.content ?? [];
        this.loading = false;
      },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }
}
