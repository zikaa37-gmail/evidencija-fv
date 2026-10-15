import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('efv_access_token', 'old-access');
    localStorage.setItem('efv_refresh_token', 'old-refresh');
    localStorage.setItem(
      'efv_user',
      JSON.stringify({ id: 1, name: 'N', email: 'n@e.t', role: 'teacher', school_id: 1 }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('does not touch requests outside the API', () => {
    http.get('translations/sr.json').subscribe();

    const request = controller.expectOne('translations/sr.json');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('adds the bearer token', () => {
    http.get('/api/students').subscribe();

    const request = controller.expectOne('/api/students');
    expect(request.request.headers.get('Authorization')).toBe('Bearer old-access');
    request.flush([]);
  });

  it('refreshes once on 401 and retries with the new token', () => {
    let result: unknown;
    http.get('/api/students').subscribe((value) => (result = value));

    controller
      .expectOne('/api/students')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    const refresh = controller.expectOne('/api/auth/refresh');
    expect(refresh.request.body).toEqual({ refresh_token: 'old-refresh' });
    refresh.flush({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      user: { id: 1, name: 'N', email: 'n@e.t', role: 'teacher', school_id: 1 },
    });

    const retried = controller.expectOne('/api/students');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer new-access');
    retried.flush(['ok']);

    expect(result).toEqual(['ok']);
    expect(localStorage.getItem('efv_refresh_token')).toBe('new-refresh');
  });

  it('clears the session when refresh fails', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.get('/api/students').subscribe({ error: () => undefined });

    controller
      .expectOne('/api/students')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    controller
      .expectOne('/api/auth/refresh')
      .flush({ message: 'expired' }, { status: 422, statusText: 'Unprocessable' });

    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
