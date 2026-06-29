import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { APP_DIALOG_IMPORTS } from '../../../shared/dialog-ui';
import { LookupSelectComponent } from '../../../shared/components/lookup-select/lookup-select.component';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models/billing.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-payment-dialog', standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule,
    LookupSelectComponent, ...APP_DIALOG_IMPORTS
  ],
  template: `
    <h2 mat-dialog-title>
      <span class="material-icons dialog-title-icon">payments</span>
      {{ 'BILLING.PAY' | translate }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">
        <div class="rms-dialog-form cm-form-dialog">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full">
            <mat-label>{{ 'BILLING.AMOUNT' | translate }}</mat-label>
            <input matInput type="number" formControlName="amount" />
          </mat-form-field>
          <app-lookup-select class="full" lookupType="PAYMENT_METHOD" labelKey="BILLING.METHOD" formControlName="paymentMethod" [required]="true"></app-lookup-select>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="app-dialog-actions">
        <button mat-stroked-button type="button" mat-dialog-close class="btn-dialog-cancel">{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button type="submit" class="btn-dialog-confirm" [disabled]="form.invalid">{{ 'COMMON.CONFIRM' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
})
export class PaymentDialogComponent {
  form = this.fb.group({
    amount: [null as number | null, Validators.required],
    paymentMethod: ['CASH', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: BillingService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Invoice
  ) {
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
