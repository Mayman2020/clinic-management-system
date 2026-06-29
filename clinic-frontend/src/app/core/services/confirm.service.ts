import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RmsDialogService } from '../../shared/services/rms-dialog.service';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private readonly dialogs: RmsDialogService) {}

  confirm(data: ConfirmDialogData): Observable<boolean | undefined> {
    return this.dialogs.confirm(data);
  }
}
