import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService), router = inject(Router);
  const isApi = request.url.startsWith(environment.apiUrl + '/');
  const token = isApi ? auth.token() : null;
  if (token) request = request.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if (isApi && error.status === 401 && !request.url.endsWith('/auth/login')) {
      auth.clear(); void router.navigateByUrl('/login');
    }
    return throwError(() => error);
  }));
};
