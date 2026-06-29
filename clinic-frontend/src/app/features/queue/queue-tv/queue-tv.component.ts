import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { QueueService } from '../../../core/services/queue.service';
import { QueueRealtimeService } from '../../../core/services/queue-realtime.service';
import { QueueToken } from '../../../core/models/queue.model';

@Component({
  selector: 'app-queue-tv', standalone: true,
  imports: [NgFor, NgIf, TranslateModule, TranslateKeyPipe, RmsDatePipe],
  templateUrl: './queue-tv.component.html',
  styleUrl: './queue-tv.component.scss'
})
export class QueueTvComponent implements OnInit, OnDestroy {
  tokens: QueueToken[] = [];
  called?: QueueToken;
  now = new Date();
  private disconnect?: () => void;
  private fallbackTimer?: ReturnType<typeof setInterval>;
  private clockTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly svc: QueueService,
    private readonly realtime: QueueRealtimeService,
    readonly i18n: I18nService
  ) {}

  get clockTime(): string {
    return this.i18n.formatDateTime(this.now, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }

  get waitingTokens(): QueueToken[] {
    return this.tokens.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  }

  get nextToken(): QueueToken | undefined {
    return this.waitingTokens.find(t => t.status === 'WAITING');
  }

  ngOnInit(): void {
    this.load();
    this.disconnect = this.realtime.connectTv(() => this.load());
    this.fallbackTimer = setInterval(() => this.load(), 60000);
    this.clockTimer = setInterval(() => { this.now = new Date(); }, 1000);
  }

  ngOnDestroy(): void {
    this.disconnect?.();
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  load(): void {
    this.svc.getTvDisplay().subscribe({
      next: (r) => {
        this.tokens = r.data ?? [];
        this.called = this.tokens.find(t => t.status === 'CALLED' || t.status === 'IN_SERVICE');
      }
    });
  }
}
