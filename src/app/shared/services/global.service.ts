import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  distinctUntilChanged,
  map,
  fromEvent,
  startWith,
  tap,
  takeUntil,
  Subject,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  isMobile = signal<boolean>(window.innerWidth < 480);

  isLoginUrl = signal<boolean>(false);
  private _resize$: any;

  constructor(private router: Router) {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginUrl.set(!!(event.url === '/auth/login'));
      }
    });

    this._resize$ = fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
      distinctUntilChanged(),
      startWith(window.innerWidth),
      tap((width) => this.isMobile.set(!!(width < 768))),
    );
    this._resize$.subscribe();
  }
}
