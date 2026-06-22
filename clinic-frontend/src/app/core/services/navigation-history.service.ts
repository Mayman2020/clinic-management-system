import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  previousUrl: string | null = null;
  enteredFromMenu = false;
  private currentUrl = '';
  constructor(router: Router) {
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      if (this.currentUrl) this.previousUrl = this.currentUrl;
      this.currentUrl = url;
      this.enteredFromMenu = false;
    });
  }
  markFromMenu(): void { this.enteredFromMenu = true; }
}
