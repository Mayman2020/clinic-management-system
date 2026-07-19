import { NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { combineLatest, firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-identity-media-fields',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div
      class="identity-pair"
      [class.identity-pair--compact]="compact"
      [class.identity-pair--single]="!showCivilSection">
      <div class="full media-field">
        <p class="field-label">{{ labelProfileKey | translate }}</p>
        <ng-container *ngIf="profileImageUrl; else profileEmpty">
          <div class="media-card media-card--media-row">
            <div class="media-thumb media-thumb--round">
              <img [src]="profileImageUrl" alt="">
            </div>
            <div class="media-side">
              <div class="media-actions" role="toolbar">
                <a mat-icon-button class="action-btn action-btn--view" [href]="profileImageUrl" target="_blank" rel="noopener noreferrer"
                   [matTooltip]="mediaTooltipView" [attr.aria-label]="mediaTooltipView" matTooltipPosition="above">
                  <mat-icon>open_in_new</mat-icon>
                </a>
                <a mat-icon-button class="action-btn action-btn--download" [href]="profileImageUrl" download target="_blank" rel="noopener noreferrer"
                   [matTooltip]="mediaTooltipDownload" [attr.aria-label]="mediaTooltipDownload" matTooltipPosition="above">
                  <mat-icon>download</mat-icon>
                </a>
                <button type="button" mat-icon-button class="action-btn action-btn--remove" (click)="emitProfile('')"
                        [matTooltip]="mediaTooltipRemove" [attr.aria-label]="mediaTooltipRemove" matTooltipPosition="above">
                  <mat-icon>delete_outline</mat-icon>
                </button>
                <button type="button" mat-icon-button class="action-btn action-btn--replace" (click)="profileFileInput.click()" [disabled]="uploadingProfile"
                        [matTooltip]="mediaTooltipReplace" [attr.aria-label]="mediaTooltipReplace" matTooltipPosition="above">
                  <span class="action-btn__icon-slot">
                    <mat-spinner *ngIf="uploadingProfile" diameter="22"></mat-spinner>
                    <mat-icon *ngIf="!uploadingProfile">drive_folder_upload</mat-icon>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </ng-container>
        <ng-template #profileEmpty>
          <div class="media-card media-card--empty media-card--tap-row">
            <div class="media-thumb media-thumb--round media-thumb--placeholder" aria-hidden="true">
              <mat-icon>person</mat-icon>
            </div>
            <button type="button" mat-icon-button color="primary" class="upload-icon-only" (click)="profileFileInput.click()" [disabled]="uploadingProfile"
                    [matTooltip]="profileUploadTooltip" [attr.aria-label]="profileUploadTooltip">
              <mat-spinner *ngIf="uploadingProfile" diameter="22"></mat-spinner>
              <mat-icon *ngIf="!uploadingProfile">add_a_photo</mat-icon>
            </button>
          </div>
        </ng-template>
        <input #profileFileInput type="file" accept="image/*" hidden (change)="onProfileFileSelected($event)">
      </div>
    </div>
  `,
  styles: [`
    .identity-pair { display: grid; grid-template-columns: 1fr; gap: 12px; width: 100%; }
    .full { display: block; width: 100%; }
    .field-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 8px; }
    .media-card { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--paper-2); }
    .media-card--media-row { flex-direction: row; flex-wrap: nowrap; }
    .media-card--empty { align-items: center; }
    .media-card--tap-row { justify-content: center; gap: 10px; }
    .media-thumb { flex-shrink: 0; border: 1px solid var(--line); background: var(--surface); display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .media-thumb--round { width: 72px; height: 72px; border-radius: 50%; }
    .media-thumb--round img { width: 100%; height: 100%; object-fit: cover; }
    .media-thumb--placeholder { color: var(--text-muted); }
    .media-thumb--placeholder mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .media-actions { display: flex; align-items: center; gap: 0; padding: 2px 4px; border-radius: 8px; background: var(--surface); border: 1px solid var(--line); }
    .action-btn { flex: 0 0 44px; width: 44px; height: 44px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
    .action-btn__icon-slot { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; }
    .action-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .action-btn--view mat-icon { color: var(--blue-700) !important; }
    .action-btn--download mat-icon { color: var(--green-700) !important; }
    .action-btn--remove mat-icon { color: var(--bad) !important; }
    .action-btn--replace mat-icon { color: var(--warn) !important; }
    .upload-icon-only mat-icon { font-size: 26px; width: 26px; height: 26px; }
  `]
})
export class IdentityMediaFieldsComponent {
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(ApiService);
  private readonly snack = inject(SnackService);
  private readonly i18n = inject(I18nService);

  @Input() labelProfileKey = 'PROFILE.IMAGE_UPLOAD';
  @Input() labelUploadProfileKey = 'PROFILE.UPLOAD_PHOTO';
  @Input() compact = false;
  @Input() showCivilSection = false;
  @Input() profileImageUrl = '';
  @Output() profileImageUrlChange = new EventEmitter<string>();

  uploadingProfile = false;
  mediaTooltipView = '';
  mediaTooltipDownload = '';
  mediaTooltipRemove = '';
  mediaTooltipReplace = '';

  constructor() {
    combineLatest([
      this.translate.stream('COMMON.VIEW_FILE'),
      this.translate.stream('ACTIONS.DOWNLOAD'),
      this.translate.stream('UPLOAD.REMOVE_FILE'),
      this.translate.stream('UPLOAD.REPLACE_FILE')
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([view, download, remove, replace]) => {
        this.mediaTooltipView = view;
        this.mediaTooltipDownload = download;
        this.mediaTooltipRemove = remove;
        this.mediaTooltipReplace = replace;
      });
  }

  get profileUploadTooltip(): string {
    return this.translate.instant(this.labelUploadProfileKey);
  }

  emitProfile(url: string): void {
    this.profileImageUrlChange.emit(url);
  }

  async onProfileFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploadingProfile = true;
    try {
      const { url } = await firstValueFrom(this.api.uploadFile(file));
      if (url) this.emitProfile(url);
    } catch {
      this.snack.error(this.i18n.instant('COMMON.ERROR'));
    } finally {
      this.uploadingProfile = false;
    }
  }
}
