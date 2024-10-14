import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, Observable, fromEvent, startWith, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  isMobileSubject = new BehaviorSubject<boolean>(false);
  isMobile$ = this.isMobileSubject.asObservable();
  isLoginUrlSubject = new BehaviorSubject<boolean>(false);
  isLoginUrl$ = this.isLoginUrlSubject.asObservable();
  private _resize$: any;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginUrlSubject.next(!!(event.url === '/auth/login'));
        console.log(this.isLoginUrlSubject.getValue());
      }
    })



    this._resize$ = fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        map(() => window.innerWidth),
        distinctUntilChanged(),
        startWith(window.innerWidth),
        tap(width => this.isMobileSubject.next(!!(width < 768))),
      );
    this._resize$.subscribe();
  }




}
