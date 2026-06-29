import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from '../../../core/services/file.service';
import { SnackService } from '../../../core/services/snack.service';

export interface RadiologyResultDialogResult {
  reportText: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-radiology-result-dialog',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'RADIOLOGY.UPLOAD_RESULT' | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'RADIOLOGY.REPORT' | translate }}</mat-label>
          <textarea matInput rows="4" formControlName="reportText"></textarea>
        </mat-form-field>
        <div class="upload-row">
          <label class="upload-btn">
            <span class="material-icons">image</span>{{ 'RADIOLOGY.UPLOAD_IMAGE' | translate }}
            <input type="file" hidden (change)="onFileSelected($event)" accept=".jpg,.jpeg,.png,.pdf">
          </label>
          <span *ngIf="uploading">{{ 'COMMON.LOADING' | translate }}</span>
        </div>
        <mat-form-field appearance="outline" class="full" *ngIf="form.value.imageUrl">
          <mat-label>{{ 'RADIOLOGY.IMAGE_URL' | translate }}</mat-label>
          <input matInput formControlName="imageUrl" readonly>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || uploading">{{ 'COMMON.CONFIRM' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .upload-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .upload-btn { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: var(--accent); }
    .full { width: 100%; }
  `]
})
export class RadiologyResultDialogComponent {
  uploading = false;
  form = this.fb.group({
    reportText: ['', Validators.required],
    imageUrl: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly files: FileService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<RadiologyResultDialogComponent, RadiologyResultDialogResult>
  ) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.files.upload(file).subscribe({
      next: (url) => { this.form.patchValue({ imageUrl: url }); this.uploading = false; },
      error: (e) => { this.snack.error(e.message); this.uploading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.ref.close({ reportText: v.reportText!, imageUrl: v.imageUrl || undefined });
  }
}
