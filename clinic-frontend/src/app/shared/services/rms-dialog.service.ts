import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';
import { RMS_DIALOG_DEFAULTS, RMS_DIALOG_PANEL_CLASS } from '../dialog-ui';

@Injectable({ providedIn: 'root' })
export class RmsDialogService {
  constructor(private readonly dialog: MatDialog) {}

  open<T, D = unknown, R = unknown>(component: ComponentType<T>, config?: MatDialogConfig<D>) {
    return this.dialog.open<T, D, R>(component, {
      ...RMS_DIALOG_DEFAULTS,
      ...config,
      panelClass: RMS_DIALOG_PANEL_CLASS
    });
  }

  confirm(data: ConfirmDialogData, width = '440px'): Observable<boolean | undefined> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        ...RMS_DIALOG_DEFAULTS,
        width,
        data
      })
      .afterClosed();
  }

  confirmDelete(messageKey = 'COMMON.CONFIRM_MESSAGE', titleKey = 'COMMON.CONFIRM_TITLE'): Observable<boolean | undefined> {
    return this.confirm({
      titleKey,
      messageKey,
      confirmKey: 'COMMON.DELETE',
      cancelKey: 'COMMON.CANCEL'
    });
  }
}
