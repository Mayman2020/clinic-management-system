import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { QueueService } from '../../../core/services/queue.service';
import { QueueRealtimeService } from '../../../core/services/queue-realtime.service';
import { QueueToken } from '../../../core/models/queue.model';

@Component({
  selector: 'app-queue-tv', standalone: true,
  imports: [NgFor, NgIf, TranslateModule, TranslateKeyPipe],
  templateUrl: './queue-tv.component.html',
  styleUrl: './queue-tv.component.scss'
})
export class QueueTvComponent implements OnInit, OnDestroy {
  tokens: QueueToken[] = [];
  called?: QueueToken;
  private disconnect?: () => void;
  private fallbackTimer?: ReturnType<typeof setInterval>;

  constructor(private readonly svc: QueueService, private readonly realtime: QueueRealtimeService) {}

  ngOnInit(): void {
    this.load();
    this.disconnect = this.realtime.connectTv(() => this.load());
    this.fallbackTimer = setInterval(() => this.load(), 60000);
  }

  ngOnDestroy(): void {
    this.disconnect?.();
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);
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
