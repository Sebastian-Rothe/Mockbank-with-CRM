import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Auth Guard - Protects routes that require authentication
 * 
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true; // User is authenticated
      } else {
        // Redirect to frontpage/login
        router.navigate(['/']);
        return false;
      }
    })
  );
};
