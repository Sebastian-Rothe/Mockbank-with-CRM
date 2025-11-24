import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { map, take } from 'rxjs/operators';

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
    take(1),
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
    })
  );
};
