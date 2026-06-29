import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Branch, BranchService } from '../../../core/services/branch.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-branch-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ (data?.id ? 'COMMON.EDIT' : 'BRANCHES.NEW') | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline"><mat-label>{{ 'BRANCHES.CODE' | translate }}</mat-label><input matInput formControlName="branchCode"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'BRANCHES.NAME' | translate }}</mat-label><input matInput formControlName="name"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.ADDRESS' | translate }}</mat-label><input matInput formControlName="address"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.EMAIL' | translate }}</mat-label><input matInput formControlName="email"></mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
})
export class BranchDialogComponent {
  form = this.fb.group({
    branchCode: ['', Validators.required],
    name: ['', Validators.required],
    address: [''],
    phone: [''],
    email: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: BranchService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<BranchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Branch | null
  ) {
    if (data) this.form.patchValue(data);
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      branchCode: v.branchCode!,
      name: v.name!,
      address: v.address || undefined,
      phone: v.phone || undefined,
      email: v.email || undefined
    };
    const req = this.data?.id ? this.svc.update(this.data.id, payload) : this.svc.create(payload);
    req.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
