import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { InsuranceService } from '../../../core/services/insurance.service';
import { InsuranceProvider } from '../../../core/models/insurance.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-insurance-claim-dialog', standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ 'INSURANCE.NEW' | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.PATIENT' | translate }} ID</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'INSURANCE.PROVIDER' | translate }}</mat-label>
      <mat-select formControlName="providerId">
        <mat-option *ngFor="let p of providers" [value]="p.id">{{ p.name }}</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'BILLING.AMOUNT' | translate }}</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class InsuranceClaimDialogComponent implements OnInit {
  providers: InsuranceProvider[] = [];
  form = this.fb.group({ patientId: [null as number | null, Validators.required], providerId: [null as number | null, Validators.required], amount: [null as number | null, Validators.required] });
  constructor(private readonly fb: FormBuilder, private readonly svc: InsuranceService, private readonly snack: SnackService, private readonly ref: MatDialogRef<InsuranceClaimDialogComponent>) {}
  ngOnInit(): void {
    this.svc.listProviders().subscribe({ next: (r) => this.providers = r.data ?? [], error: (e) => this.snack.error(e.message) });
  }
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.createClaim({ patientId: v.patientId!, providerId: v.providerId!, amount: v.amount! }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
