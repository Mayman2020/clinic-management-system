import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { APP_DIALOG_IMPORTS } from '../../../shared/dialog-ui';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { SnackService } from '../../../core/services/snack.service';

export interface LookupDialogData {
  type: LookupType;
  item?: LookupItem;
}

@Component({
  selector: 'app-lookup-dialog', standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCheckboxModule, TranslateModule, ...APP_DIALOG_IMPORTS
  ],
  template: `
    <h2 mat-dialog-title>
      <span class="material-icons dialog-title-icon">list_alt</span>
      {{ (data.item ? 'COMMON.EDIT' : 'LOOKUPS.NEW') | translate }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">
        <div class="rms-dialog-form cm-form-dialog">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'LOOKUPS.CODE' | translate }}</mat-label>
            <input matInput formControlName="code" [readonly]="!!data.item?.locked" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'LOOKUPS.SORT_ORDER' | translate }}</mat-label>
            <input matInput type="number" formControlName="sortOrder" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full">
            <mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label>
            <input matInput formControlName="nameAr" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full">
            <mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label>
            <input matInput formControlName="nameEn" />
          </mat-form-field>
          <mat-checkbox *ngIf="data.item" formControlName="active" class="full">{{ 'LOOKUPS.ACTIVE' | translate }}</mat-checkbox>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="app-dialog-actions">
        <button mat-stroked-button type="button" mat-dialog-close class="btn-dialog-cancel">{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button type="submit" class="btn-dialog-confirm" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
})
export class LookupDialogComponent implements OnInit {
  form = this.fb.group({
    code: [''],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    sortOrder: [0],
    active: [true]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly lookupSvc: LookupService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<LookupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LookupDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.item) {
      this.form.patchValue({
        code: this.data.item.code,
        nameAr: this.data.item.nameAr,
        nameEn: this.data.item.nameEn,
        sortOrder: this.data.item.sortOrder,
        active: this.data.item.active
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const req = this.data.item
      ? this.lookupSvc.update(this.data.item.id, {
          code: v.code!, nameAr: v.nameAr!, nameEn: v.nameEn!,
          sortOrder: v.sortOrder ?? 0, active: v.active ?? true
        })
      : this.lookupSvc.create({
          type: this.data.type, code: v.code || undefined,
          nameAr: v.nameAr!, nameEn: v.nameEn!, sortOrder: v.sortOrder ?? 0
        });
    req.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
