import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Session, User } from '../../shared/models/erp.model';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<Session | null>(this.restore());
  readonly user = computed(() => this.session()?.user ?? null);
  readonly canApprove = computed(() => ['ADMIN', 'MANAGER'].includes(this.user()?.role ?? ''));
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  token(): string | null {
    const current = this.session();
    if (current && Date.parse(current.expiresAt) > Date.now()) return current.accessToken;
    this.clear(); return null;
  }
  login(username: string, password: string) {
    return this.http.post<Session>(environment.apiUrl + '/auth/login', { username, password }).pipe(tap(session => {
      sessionStorage.setItem('erp.session', JSON.stringify(session)); this.session.set(session);
    }));
  }
  refreshUser() {
    return this.http.get<User>(environment.apiUrl + '/auth/me').pipe(tap(user => {
      const session = this.session();
      if (session) { const next = { ...session, user }; this.session.set(next); sessionStorage.setItem('erp.session', JSON.stringify(next)); }
    }));
  }
  clear(): void { sessionStorage.removeItem('erp.session'); this.session.set(null); }
  private restore(): Session | null {
    try {
      const value: Session = JSON.parse(sessionStorage.getItem('erp.session') ?? 'null');
      return value?.accessToken && value.user && Date.parse(value.expiresAt) > Date.now() ? value : null;
    } catch { return null; }
  }
}
