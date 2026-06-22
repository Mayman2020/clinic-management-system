import { Component, Inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-doctor-schedule-dialog', standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'DOCTORS.SCHEDULES' | translate }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'DOCTORS.DAY' | translate }}</mat-label>
          <mat-select formControlName="dayOfWeek">
            <mat-option *ngFor="let d of days" [value]="d.v">{{ ('DAY.' + d.v) | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.START' | translate }}</mat-label><input matInput type="time" formControlName="startTime"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.END' | translate }}</mat-label><input matInput type="time" formControlName="endTime"></mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>`
})
export class DoctorScheduleDialogComponent {
  days = [0,1,2,3,4,5,6].map(v => ({ v }));
  form = this.fb.group({ dayOfWeek: [1, Validators.required], startTime: ['09:00', Validators.required], endTime: ['17:00', Validators.required] });
  constructor(
    private readonly fb: FormBuilder, private readonly svc: DoctorService, private readonly snack: SnackService,
    private readonly ref: MatDialogRef<DoctorScheduleDialogComponent>, @Inject(MAT_DIALOG_DATA) public doctorId: number
  ) {}
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.saveSchedule(this.doctorId, { dayOfWeek: v.dayOfWeek!, startTime: v.startTime!, endTime: v.endTime! }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
