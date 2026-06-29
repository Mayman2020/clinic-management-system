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

export interface LabResultDialogResult {
  resultPdfUrl: string;
}

@Component({
  selector: 'app-lab-result-dialog',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'LAB.UPLOAD_RESULT' | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <div class="upload-row">
          <label class="upload-btn">
            <span class="material-icons">upload_file</span>{{ 'LAB.RESULT_PDF' | translate }}
            <input type="file" hidden (change)="onFileSelected($event)" accept=".pdf">
          </label>
          <span *ngIf="uploading">{{ 'COMMON.LOADING' | translate }}</span>
        </div>
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'LAB.RESULT_URL' | translate }}</mat-label>
          <input matInput formControlName="resultPdfUrl" readonly>
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
export class LabResultDialogComponent {
  uploading = false;
  form = this.fb.group({ resultPdfUrl: ['', Validators.required] });

  constructor(
    private readonly fb: FormBuilder,
    private readonly files: FileService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<LabResultDialogComponent, LabResultDialogResult>
  ) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.files.upload(file).subscribe({
      next: (url) => { this.form.patchValue({ resultPdfUrl: url }); this.uploading = false; },
      error: (e) => { this.snack.error(e.message); this.uploading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.ref.close({ resultPdfUrl: this.form.value.resultPdfUrl! });
  }
}
