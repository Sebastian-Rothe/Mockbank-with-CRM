import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { map, filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Auth Guard - Protects routes that require authentication
 * 
 * Waits for Firebase auth to initialize, then checks authentication
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    // Wait for the first non-null emission or explicit null after auth loads
    filter((user) => user !== undefined), // Skip undefined initial state
    take(1),
    timeout(5000), // 5 second timeout to prevent infinite waiting
    map((user) => {
      if (user && user !== null) {
        return true; // User is authenticated
      } else {
        // Redirect to frontpage/login
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      // On timeout or error, redirect to login
      router.navigate(['/']);
      return of(false);
    })
  );
};
