import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-prescription-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ 'PRESCRIPTION.NEW' | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.PATIENT' | translate }} ID</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.DOCTOR' | translate }} ID</mat-label><input matInput type="number" formControlName="doctorId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'PRESCRIPTION.MEDICINE' | translate }}</mat-label><input matInput formControlName="medicineName"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'PRESCRIPTION.DOSAGE' | translate }}</mat-label><input matInput formControlName="dosage"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class PrescriptionDialogComponent {
  form = this.fb.group({ patientId: [null as number | null, Validators.required], doctorId: [null as number | null, Validators.required], medicineName: ['', Validators.required], dosage: [''] });
  constructor(private readonly fb: FormBuilder, private readonly svc: PrescriptionService, private readonly snack: SnackService, private readonly ref: MatDialogRef<PrescriptionDialogComponent>) {}
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.create({ patientId: v.patientId!, doctorId: v.doctorId!, items: [{ medicineName: v.medicineName!, dosage: v.dosage ?? undefined }] }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
