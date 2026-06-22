import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { BillingService } from '../../../core/services/billing.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-invoice-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ 'BILLING.NEW' | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.PATIENT' | translate }} ID</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'BILLING.AMOUNT' | translate }}</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'COMMON.NOTES' | translate }}</mat-label><input matInput formControlName="description"></mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class InvoiceDialogComponent {
  form = this.fb.group({ patientId: [null as number | null, Validators.required], amount: [null as number | null, Validators.required], description: ['Consultation'] });
  constructor(private readonly fb: FormBuilder, private readonly svc: BillingService, private readonly snack: SnackService, private readonly ref: MatDialogRef<InvoiceDialogComponent>) {}
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.createInvoice({
      patientId: v.patientId,
      items: [{ description: v.description, quantity: 1, unitPrice: v.amount }]
    }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
