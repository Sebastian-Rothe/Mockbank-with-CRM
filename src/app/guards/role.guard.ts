import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { map, filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Role Guard - Protects routes based on user roles
 * 
 * Usage in routes:
 * { path: 'admin', component: AdminComponent, canActivate: [roleGuard], data: { roles: ['admin', 'management'] } }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);

  const requiredRoles = route.data['roles'] as string[];

  return authService.user$.pipe(
    filter((user) => user !== undefined), // Wait for auth to load
    take(1),
    timeout(5000),
    map((user) => {
      if (!user) {
        // User not authenticated
        router.navigate(['/']);
        return false;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = requiredRoles.includes(user['role']);
        
        if (!hasRole) {
          snackbarService.error('You do not have permission to access this page.');
          router.navigate(['/main/dashboard']);
          return false;
        }
      }

      return true; // User has required role
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
