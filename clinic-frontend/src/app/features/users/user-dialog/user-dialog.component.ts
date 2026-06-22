import { Component, Inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { USER_ROLE_VALUES, User, UserRole } from '../../../core/models/user.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-user-dialog', standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, TranslateModule],
  template: `<h2 mat-dialog-title>{{ (data?.id ? 'COMMON.EDIT' : 'USERS.NEW') | translate }}</h2>
  <form [formGroup]="form" (ngSubmit)="save()"><mat-dialog-content>
    <mat-form-field appearance="outline"><mat-label>{{ 'USERS.USERNAME' | translate }}</mat-label><input matInput formControlName="username"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label><input matInput formControlName="email"></mat-form-field>
    <mat-form-field appearance="outline" *ngIf="!data?.id"><mat-label>{{ 'AUTH.PASSWORD' | translate }}</mat-label><input matInput type="password" formControlName="password"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'USERS.FULL_NAME' | translate }}</mat-label><input matInput formControlName="fullName"></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'USERS.ROLE' | translate }}</mat-label>
      <mat-select formControlName="role">
        <mat-option *ngFor="let r of roles" [value]="r">{{ ('ROLE.' + r) | translate }}</mat-option>
      </mat-select>
    </mat-form-field>
  </mat-dialog-content><mat-dialog-actions align="end">
    <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </mat-dialog-actions></form>`
})
export class UserDialogComponent {
  roles = USER_ROLE_VALUES;
  form = this.fb.group({ username: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: [''], fullName: [''], role: ['RECEPTIONIST' as UserRole, Validators.required] });
  constructor(private readonly fb: FormBuilder, private readonly svc: UserService, private readonly snack: SnackService,
    private readonly ref: MatDialogRef<UserDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Partial<User> | null) {
    if (data) this.form.patchValue({ username: data.username, email: data.email, fullName: data.fullName, role: data.role });
  }
  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as Partial<User> & { password?: string };
    const req = this.data?.id ? this.svc.update(this.data.id, payload) : this.svc.create(payload);
    req.subscribe({ next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); }, error: (e) => this.snack.error(e.message) });
  }
}
