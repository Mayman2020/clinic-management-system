import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { QueueService } from '../../../core/services/queue.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-queue-token-dialog', standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'QUEUE.GENERATE' | translate }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.PATIENT' | translate }} ID</mat-label><input matInput type="number" formControlName="patientId"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'APPOINTMENTS.DOCTOR' | translate }} ID</mat-label><input matInput type="number" formControlName="doctorId"></mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>`
})
export class QueueTokenDialogComponent {
  form = this.fb.group({ patientId: [null as number | null, Validators.required], doctorId: [null as number | null] });
  constructor(private readonly fb: FormBuilder, private readonly svc: QueueService, private readonly snack: SnackService, private readonly ref: MatDialogRef<QueueTokenDialogComponent>) {}
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.generateToken({ patientId: v.patientId!, doctorId: v.doctorId ?? undefined, queueDate: new Date().toISOString().slice(0, 10) }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
