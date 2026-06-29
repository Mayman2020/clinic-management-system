import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { InsuranceService } from '../../../core/services/insurance.service';
import { InsuranceProvider } from '../../../core/models/insurance.model';
import { SnackService } from '../../../core/services/snack.service';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';

export interface InsuranceClaimDialogData {
  patientId?: number;
  invoiceId?: number;
  amount?: number;
}

@Component({
  selector: 'app-insurance-claim-dialog', standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, TranslateModule, PatientSearchFieldComponent],
  template: `
    <h2 mat-dialog-title>{{ 'INSURANCE.NEW' | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <app-patient-search-field formControlName="patientId"></app-patient-search-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'INSURANCE.PROVIDER' | translate }}</mat-label>
          <mat-select formControlName="providerId">
            <mat-option *ngFor="let p of providers" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'BILLING.AMOUNT' | translate }}</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
        <mat-form-field appearance="outline" *ngIf="invoiceId"><mat-label>{{ 'BILLING.INVOICE_NO' | translate }}</mat-label><input matInput [value]="'#' + invoiceId" readonly></mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
})
export class InsuranceClaimDialogComponent implements OnInit {
  providers: InsuranceProvider[] = [];
  invoiceId?: number;
  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    providerId: [null as number | null, Validators.required],
    amount: [null as number | null, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: InsuranceService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<InsuranceClaimDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: InsuranceClaimDialogData | null
  ) {
    if (data) {
      this.form.patchValue({ patientId: data.patientId ?? null, amount: data.amount ?? null });
      this.invoiceId = data.invoiceId;
    }
  }

  ngOnInit(): void {
    this.svc.listProviders().subscribe({ next: (r) => this.providers = r.data ?? [], error: (e) => this.snack.error(e.message) });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.createClaim({
      patientId: v.patientId!,
      providerId: v.providerId!,
      amount: v.amount!,
      invoiceId: this.invoiceId
    }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
