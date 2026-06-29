import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SnackService } from '../../../core/services/snack.service';
import { Appointment } from '../../../core/models/appointment.model';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';
import { DoctorSearchFieldComponent } from '../../../shared/components/doctor-search-field/doctor-search-field.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { finalize } from 'rxjs/operators';

export type AppointmentDialogMode = 'book' | 'walkin' | 'reschedule';
export interface AppointmentDialogData {
  mode?: AppointmentDialogMode;
  appointment?: Appointment;
}

@Component({
  selector: 'app-appointment-dialog', standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule, PatientSearchFieldComponent, DoctorSearchFieldComponent, DateFieldComponent],
  template: `
    <h2 mat-dialog-title>{{ titleKey | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <app-patient-search-field *ngIf="mode !== 'reschedule'" formControlName="patientId"></app-patient-search-field>
        <app-doctor-search-field formControlName="doctorId"></app-doctor-search-field>
        <app-date-field formControlName="appointmentDate" labelKey="COMMON.DATE" [required]="true" [compact]="true"></app-date-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.TIME' | translate }}</mat-label><input matInput type="time" formControlName="startTime"></mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="saving">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
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
  saving = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: AppointmentService,
    private readonly snack: SnackService,
    private readonly translate: TranslateService,
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
    if (this.form.invalid || this.saving) return;
    const v = this.form.getRawValue();
    const payload = { patientId: v.patientId!, doctorId: v.doctorId!, appointmentDate: v.appointmentDate!, startTime: v.startTime! };
    const request$ = this.mode === 'walkin' ? this.svc.walkIn(payload)
      : this.mode === 'reschedule' && this.appointmentId ? this.svc.reschedule(this.appointmentId, payload)
      : this.svc.book(payload);
    this.saving = true;
    request$.pipe(finalize(() => { this.saving = false; })).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => {
        const code = e?.error?.errorCode ?? e?.errorCode;
        if (code === 'APPOINTMENT_OVERLAP') {
          this.snack.error(this.translate.instant('APPOINTMENTS.DOCTOR_UNAVAILABLE'));
        } else {
          this.snack.error(e.message);
        }
      }
    });
  }
}
