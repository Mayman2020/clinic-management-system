import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Appointment } from '../../../core/models/appointment.model';
import { QueueToken } from '../../../core/models/queue.model';

export interface CheckInResultData {
  appointment: Appointment;
  queueToken: QueueToken;
}

@Component({
  selector: 'app-check-in-result-dialog',
  standalone: true,
  imports: [NgIf, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'WORKFLOW.CHECKED_IN' | translate }}</h2>
    <mat-dialog-content>
      <p class="token-label">{{ 'QUEUE.TOKEN_NUMBER' | translate }}</p>
      <p class="token-num">{{ data.queueToken.tokenNumber }}</p>
      <p *ngIf="data.queueToken.patientName" class="meta">{{ data.queueToken.patientName }}</p>
      <p *ngIf="data.queueToken.doctorName" class="meta">{{ data.queueToken.doctorName }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CLOSE' | translate }}</button>
      <button mat-stroked-button type="button" (click)="goToQueue()">{{ 'WORKFLOW.GO_TO_QUEUE' | translate }}</button>
      <button mat-flat-button color="primary" type="button" (click)="startConsultation()">{{ 'WORKFLOW.START_CONSULTATION' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .token-label { margin: 0; color: var(--text-muted); font-size: 13px; }
    .token-num { font-size: 48px; font-weight: 700; margin: 8px 0; color: var(--accent); }
    .meta { margin: 4px 0; color: var(--text-muted); }
  `]
})
export class CheckInResultDialogComponent {
  constructor(
    private readonly router: Router,
    private readonly ref: MatDialogRef<CheckInResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: CheckInResultData
  ) {}

  goToQueue(): void {
    this.ref.close();
    void this.router.navigate(['/admin/queue']);
  }

  startConsultation(): void {
    const a = this.data.appointment;
    this.ref.close();
    void this.router.navigate(['/admin/consultation/new'], {
      queryParams: { patientId: a.patientId, doctorId: a.doctorId, appointmentId: a.id }
    });
  }
}
