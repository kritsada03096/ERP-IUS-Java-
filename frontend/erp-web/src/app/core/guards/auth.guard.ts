import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const authGuard: CanActivateFn = () => inject(AuthService).token() ? true : inject(Router).createUrlTree(['/login']);
export const approvalGuard: CanActivateFn = () => inject(AuthService).canApprove() ? true : inject(Router).createUrlTree(['/dashboard']);
