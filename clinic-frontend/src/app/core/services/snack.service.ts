import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { resolveUserMessage } from '../utils/user-message.util';
@Injectable({ providedIn: 'root' })
export class SnackService {
  constructor(private readonly snack: MatSnackBar, private readonly translate: TranslateService) {}
  success(message: string): void { this.open(resolveUserMessage(message, this.translate), 'success-snack', 3500); }
  error(message: string): void { this.open(resolveUserMessage(message, this.translate), 'error-snack', 5000); }
  info(message: string): void { this.open(resolveUserMessage(message, this.translate), 'info-snack', 3000); }
  private open(message: string, panelClass: string, duration: number): void {
    this.snack.open(message, '✕', { duration, panelClass: [panelClass], horizontalPosition: 'end' });
  }
}
