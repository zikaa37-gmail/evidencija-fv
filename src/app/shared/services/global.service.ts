import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, fromEvent, map } from 'rxjs';

const MOBILE_MAX_WIDTH = 768;

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  readonly isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth < MOBILE_MAX_WIDTH),
      distinctUntilChanged(),
    ),
    { initialValue: window.innerWidth < MOBILE_MAX_WIDTH },
  );
}
