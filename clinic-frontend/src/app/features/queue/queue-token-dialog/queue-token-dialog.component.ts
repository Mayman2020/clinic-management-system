import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { QueueService } from '../../../core/services/queue.service';
import { SnackService } from '../../../core/services/snack.service';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';
import { DoctorSearchFieldComponent } from '../../../shared/components/doctor-search-field/doctor-search-field.component';

export interface QueueTokenDialogData {
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
}

@Component({
  selector: 'app-queue-token-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, TranslateModule, PatientSearchFieldComponent, DoctorSearchFieldComponent],
  template: `
    <h2 mat-dialog-title>{{ 'QUEUE.GENERATE' | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <app-patient-search-field formControlName="patientId"></app-patient-search-field>
        <app-doctor-search-field formControlName="doctorId"></app-doctor-search-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
})
export class QueueTokenDialogComponent {
  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: QueueService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<QueueTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: QueueTokenDialogData | null
  ) {
    if (data) this.form.patchValue({ patientId: data.patientId ?? null, doctorId: data.doctorId ?? null });
    this.appointmentId = data?.appointmentId;
  }

  private readonly appointmentId?: number;

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.generateToken({
      patientId: v.patientId!,
      doctorId: v.doctorId ?? undefined,
      appointmentId: this.appointmentId,
      queueDate: new Date().toISOString().slice(0, 10)
    }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
