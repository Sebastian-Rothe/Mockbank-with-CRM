import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { map, take } from 'rxjs/operators';

/**
 * Guest Guard - Prevents guest users from accessing certain features
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (!user) {
        router.navigate(['/']);
        return false;
      }

      const isGuest = authService.isGuestUser();
      
      if (isGuest) {
        snackbarService.warning('Not available for guests');
        router.navigate(['/main/dashboard']);
        return false;
      }

      return true;
    })
  );
};
