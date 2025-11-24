import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { map, take } from 'rxjs/operators';

/**
 * Guest Guard - Prevents guest users from accessing certain features
 * 
 * Usage in routes:
 * { path: 'premium', component: PremiumComponent, canActivate: [guestGuard] }
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        router.navigate(['/']);
        return false;
      }

      const isGuest = authService.isGuestUser();
      
      if (isGuest) {
        snackbarService.warning('This feature is not available for guest users. Please create a full account.');
        router.navigate(['/main/dashboard']);
        return false;
      }

      return true; // User is not a guest
    })
  );
};
