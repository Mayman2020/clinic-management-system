import { MatDialogModule } from '@angular/material/dialog';
import { DialogTitleCloseDirective } from './directives/dialog-title-close.directive';

export const APP_DIALOG_IMPORTS = [MatDialogModule, DialogTitleCloseDirective] as const;

export const RMS_DIALOG_PANEL_CLASS = 'app-dialog-panel';

export const RMS_DIALOG_DEFAULTS = {
  panelClass: RMS_DIALOG_PANEL_CLASS,
  disableClose: true,
  autoFocus: 'first-tabbable' as const
};
