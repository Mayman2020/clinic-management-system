import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SnackService } from '../../../core/services/snack.service';
import { Appointment } from '../../../core/models/appointment.model';

export type AppointmentDialogMode = 'book' | 'walkin' | 'reschedule';
export interface AppointmentDialogData {
  mode?: AppointmentDialogMode;
  appointment?: Appointment;
}

@Component({
  selector: 'app-appointment-dialog', standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ titleKey | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline" *ngIf="mode !== 'reschedule'"><mat-label>{{ 'APPOINTMENTS.PATIENT' | translate }} ID</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.DOCTOR' | translate }} ID</mat-label><input matInput type="number" formControlName="doctorId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.DATE' | translate }}</mat-label><input matInput type="date" formControlName="appointmentDate"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.TIME' | translate }}</mat-label><input matInput type="time" formControlName="startTime"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class AppointmentDialogComponent {
  mode: AppointmentDialogMode;
  titleKey: string;
  private readonly appointmentId?: number;
  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null, Validators.required],
    appointmentDate: ['', Validators.required],
    startTime: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: AppointmentService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: AppointmentDialogData | null
  ) {
    this.mode = data?.mode ?? 'book';
    this.titleKey = this.mode === 'walkin' ? 'APPOINTMENTS.WALK_IN' : this.mode === 'reschedule' ? 'APPOINTMENTS.RESCHEDULE' : 'APPOINTMENTS.BOOK';
    if (data?.appointment) {
      this.appointmentId = data.appointment.id;
      this.form.patchValue({
        patientId: data.appointment.patientId,
        doctorId: data.appointment.doctorId,
        appointmentDate: data.appointment.appointmentDate,
        startTime: data.appointment.startTime
      });
      if (this.mode === 'reschedule') this.form.get('patientId')?.disable();
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = { patientId: v.patientId!, doctorId: v.doctorId!, appointmentDate: v.appointmentDate!, startTime: v.startTime! };
    const request$ = this.mode === 'walkin' ? this.svc.walkIn(payload)
      : this.mode === 'reschedule' && this.appointmentId ? this.svc.reschedule(this.appointmentId, payload)
      : this.svc.book(payload);
    request$.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
