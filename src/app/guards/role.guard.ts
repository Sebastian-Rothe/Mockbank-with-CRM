import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { map, take, switchMap } from 'rxjs/operators';

/**
 * Role Guard - Protects routes based on user roles
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const auth = inject(Auth);
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);

  const requiredRoles = route.data['roles'] as string[];

  return authState(auth).pipe(
    take(1),
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        router.navigate(['/']);
        return [false];
      }
      
      return authService.user$.pipe(
        take(1),
        map((user) => {
          if (!user) {
            router.navigate(['/']);
            return false;
          }

          if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.includes(user['role']);
            
            if (!hasRole) {
              snackbarService.error('No permission');
              router.navigate(['/main/dashboard']);
              return false;
            }
          }

          return true;
        })
      );
    })
  );
};
