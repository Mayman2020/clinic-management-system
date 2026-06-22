import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models/billing.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-payment-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ 'BILLING.PAY' | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'BILLING.AMOUNT' | translate }}</mat-label><input matInput type="number" formControlName="amount"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'BILLING.METHOD' | translate }}</mat-label>
      <mat-select formControlName="paymentMethod">
        <mat-option value="CASH">{{ 'PAYMENT_METHOD.CASH' | translate }}</mat-option>
        <mat-option value="CARD">{{ 'PAYMENT_METHOD.CARD' | translate }}</mat-option>
      </mat-select>
    </mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.CONFIRM' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class PaymentDialogComponent {
  form = this.fb.group({ amount: [null as number | null, Validators.required], paymentMethod: ['CASH', Validators.required] });
  constructor(private readonly fb: FormBuilder, private readonly svc: BillingService, private readonly snack: SnackService,
    private readonly ref: MatDialogRef<PaymentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Invoice) {
    this.form.patchValue({ amount: data.total - (data.paidAmount ?? 0) });
  }
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.mixedPayment(this.data.id, { payments: [{ amount: v.amount, paymentMethod: v.paymentMethod }] }).subscribe({
      next: () => { this.snack.success('MESSAGES.PAYMENT_RECORDED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
