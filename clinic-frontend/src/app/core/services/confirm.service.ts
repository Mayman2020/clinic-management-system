import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DeleteConfirmService } from './delete-confirm.service';
import { RmsDialogService } from '../../shared/services/rms-dialog.service';

/** @deprecated Prefer DeleteConfirmService for deletes; kept for non-delete confirms */
export interface LegacyConfirmData {
  titleKey: string;
  messageKey: string;
  confirmKey?: string;
  cancelKey?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(
    private readonly dialogs: RmsDialogService,
    private readonly deleteConfirm: DeleteConfirmService
  ) {}

  confirm(data: LegacyConfirmData): Observable<boolean | undefined> {
    return this.dialogs.confirm({
      title: data.titleKey,
      message: data.messageKey,
      confirmLabel: data.confirmKey ?? 'COMMON.CONFIRM',
      cancelLabel: data.cancelKey ?? 'COMMON.CANCEL',
      danger: data.danger ?? false
    } as ConfirmDialogData);
  }

  confirmDelete(messageKey = 'DIALOG.DELETE_GENERIC', titleKey = 'DIALOG.DELETE_TITLE'): Observable<boolean> {
    return this.deleteConfirm.openDeleteConfirm({ titleKey, messageKey });
  }
}
