import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TokenResponse, User } from './user.model';

const ACCESS_TOKEN_KEY = 'efv_access_token';
const REFRESH_TOKEN_KEY = 'efv_refresh_token';
const USER_KEY = 'efv_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  #http = inject(HttpClient);
  #router = inject(Router);
  #apiUrl = environment.apiUrl;
  #refreshInFlight: Observable<TokenResponse> | null = null;

  #currentUser = signal<User | null>(this.#readStoredUser());
  readonly currentUser = this.#currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.#currentUser() !== null);
  readonly isAdmin = computed(() => this.#currentUser()?.role === 'admin');

  login(email: string, password: string): Observable<TokenResponse> {
    return this.#http
      .post<TokenResponse>(`${this.#apiUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.#storeSession(response)));
  }

  refresh(): Observable<TokenResponse> {
    this.#refreshInFlight ??= this.#http
      .post<TokenResponse>(`${this.#apiUrl}/auth/refresh`, {
        refresh_token: this.refreshToken(),
      })
      .pipe(
        tap({
          next: (response) => this.#storeSession(response),
          finalize: () => (this.#refreshInFlight = null),
        }),
        shareReplay(1),
      );

    return this.#refreshInFlight;
  }

  logout(): void {
    const refreshToken = this.refreshToken();
    this.clearSession();
    this.#http
      .post(`${this.#apiUrl}/auth/logout`, { refresh_token: refreshToken })
      .subscribe({ error: () => undefined });
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.#currentUser.set(null);
    this.#router.navigate(['/login']);
  }

  accessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  #storeSession(response: TokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.#currentUser.set(response.user);
  }

  #readStoredUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored || !localStorage.getItem(REFRESH_TOKEN_KEY)) {
      return null;
    }
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
}
