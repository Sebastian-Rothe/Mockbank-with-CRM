import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { map, take, switchMap } from 'rxjs/operators';

/**
 * Guest Guard - Prevents guest users (with role 'guest') from accessing certain features
 * Now checks the actual role in Firestore, not just isAnonymous status
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);

  return authState(auth).pipe(
    take(1),
    switchMap((user) => {
      if (!user) {
        router.navigate(['/']);
        return [false];
      }

      // Get the actual user data with role from Firestore
      return authService.user$.pipe(
        take(1),
        map((userData) => {
          // Check if user role is 'guest'
          if (userData?.role === 'guest') {
            snackbarService.warning('Not available for guests. Please upgrade your account.');
            router.navigate(['/main/dashboard']);
            return false;
          }

          return true;
        })
      );
    })
  );
};
