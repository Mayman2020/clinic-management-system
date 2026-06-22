import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-doctor-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ (data?.id ? 'COMMON.EDIT' : 'DOCTORS.NEW') | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.NAME' | translate }}</mat-label><input matInput formControlName="firstName"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.LAST_NAME' | translate }}</mat-label><input matInput formControlName="lastName"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.SPECIALTY' | translate }}</mat-label><input matInput formControlName="specialty"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.DEPARTMENT' | translate }}</mat-label><input matInput formControlName="department"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'DOCTORS.FEE' | translate }}</mat-label><input matInput type="number" formControlName="consultationFee"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class DoctorDialogComponent {
  form = this.fb.group({ firstName: ['', Validators.required], lastName: ['', Validators.required], specialty: ['', Validators.required], department: [''], phone: [''], consultationFee: [null as number | null] });
  constructor(private readonly fb: FormBuilder, private readonly svc: DoctorService, private readonly snack: SnackService,
    private readonly ref: MatDialogRef<DoctorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Partial<Doctor> | null) {
    if (data) this.form.patchValue(data);
  }
  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as Partial<Doctor>;
    const req = this.data?.id ? this.svc.update(this.data.id, payload) : this.svc.create(payload);
    req.subscribe({ next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); }, error: (e) => this.snack.error(e.message) });
  }
}
