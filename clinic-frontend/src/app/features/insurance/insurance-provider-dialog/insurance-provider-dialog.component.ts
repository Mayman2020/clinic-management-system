import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { InsuranceService } from '../../../core/services/insurance.service';
import { SnackService } from '../../../core/services/snack.service';
import { InsuranceProvider } from '../../../core/models/insurance.model';

@Component({
  selector: 'app-insurance-provider-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ (provider ? 'COMMON.EDIT' : 'COMMON.CREATE') | translate }} — {{ 'INSURANCE.PROVIDERS' | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'INSURANCE.PROVIDER_NAME' | translate }}</mat-label><input matInput formControlName="name"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.PHONE' | translate }}</mat-label><input matInput formControlName="contactPhone"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label><input matInput formControlName="contactEmail"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.NOTES' | translate }}</mat-label><textarea matInput rows="3" formControlName="coverageNotes"></textarea></mat-form-field>
    <mat-checkbox formControlName="active">{{ 'REPORTS.ACTIVE' | translate }}</mat-checkbox>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class InsuranceProviderDialogComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    contactPhone: [''],
    contactEmail: [''],
    coverageNotes: [''],
    active: [true]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: InsuranceService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<InsuranceProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public provider: InsuranceProvider | null
  ) {
    if (provider) this.form.patchValue(provider);
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as Partial<InsuranceProvider>;
    const req$ = this.provider?.id ? this.svc.updateProvider(this.provider.id, payload) : this.svc.createProvider(payload);
    req$.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
