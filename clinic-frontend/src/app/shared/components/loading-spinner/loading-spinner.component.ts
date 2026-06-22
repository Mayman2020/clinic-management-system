import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '../../../core/services/loading.service';
@Component({
  selector: 'app-loading-spinner', standalone: true, imports: [AsyncPipe, NgIf, TranslateModule],
  template: `<div class="app-loading-shell" *ngIf="loading.isLoading$ | async" aria-live="polite"><div class="app-loading-veil"></div><div class="app-loading-bar"></div><div class="app-loading-pill"><span class="app-loading-ring"></span><span class="app-loading-text">{{ 'COMMON.LOADING' | translate }}</span></div></div>`,
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent { constructor(readonly loading: LoadingService) {} }
