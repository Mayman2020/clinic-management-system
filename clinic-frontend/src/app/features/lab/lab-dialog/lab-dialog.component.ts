import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { LabService } from '../../../core/services/lab.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-lab-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ 'LAB.NEW' | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.PATIENT' | translate }} ID</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'LAB.TEST_TYPE' | translate }}</mat-label><input matInput formControlName="testType"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'LAB.CATEGORY' | translate }}</mat-label><input matInput formControlName="testCategory"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class LabDialogComponent {
  form = this.fb.group({ patientId: [null as number | null, Validators.required], testType: ['', Validators.required], testCategory: [''] });
  constructor(private readonly fb: FormBuilder, private readonly svc: LabService, private readonly snack: SnackService, private readonly ref: MatDialogRef<LabDialogComponent>) {}
  save(): void {
    if (this.form.invalid) return;
    this.svc.create(this.form.getRawValue() as { patientId: number; testType: string; testCategory?: string }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
