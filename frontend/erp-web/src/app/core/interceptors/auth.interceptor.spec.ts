import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('API authentication boundary', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const session = {
    accessToken: 'test-token', expiresAt: new Date(Date.now() + 60000).toISOString(),
    user: { id: 1, username: 'employee', displayName: 'Employee', role: 'EMPLOYEE', departmentId: 1, departmentName: 'IT' }
  };
  beforeEach(() => {
    sessionStorage.setItem('erp.session', JSON.stringify(session));
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()
    ] });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { backend.verify(); sessionStorage.clear(); });

  it('adds the bearer token to ERP API calls', () => {
    http.get('/api/v1/products').subscribe();
    const request = backend.expectOne('/api/v1/products');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush([]);
  });
  it('does not send the token to external URLs or similar path prefixes', () => {
    for (const url of ['https://example.com/data', '/api/v10/data']) {
      http.get(url).subscribe();
      const request = backend.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush({});
    }
  });
  it('clears a rejected session and redirects to login', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    http.get('/api/v1/products').subscribe({ error: () => {} });
    backend.expectOne('/api/v1/products').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(AuthService).user()).toBeNull();
    expect(sessionStorage.getItem('erp.session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
  it('does not restore an expired session', () => {
    sessionStorage.setItem('erp.session', JSON.stringify({ ...session, expiresAt: '2000-01-01T00:00:00Z' }));
    expect(TestBed.inject(AuthService).token()).toBeNull();
    expect(TestBed.inject(AuthService).user()).toBeNull();
  });
});
