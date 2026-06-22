import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmDialogData {
  titleKey: string;
  messageKey: string;
  confirmKey?: string;
  cancelKey?: string;
}

@Component({
  selector: 'app-confirm-dialog', standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ data.titleKey | translate }}</h2>
    <mat-dialog-content><p>{{ data.messageKey | translate }}</p></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>{{ (data.cancelKey || 'COMMON.CANCEL') | translate }}</button>
      <button mat-flat-button color="primary" type="button" [mat-dialog-close]="true">{{ (data.confirmKey || 'COMMON.CONFIRM') | translate }}</button>
    </mat-dialog-actions>`
})
export class ConfirmDialogComponent {
  constructor(
    private readonly ref: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ConfirmDialogData
  ) {}
}
