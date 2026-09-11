import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Ensures a signed-in user has the role declared in route data. */
export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const requiredRole = route.data['role'] as string | undefined;
  const role = localStorage.getItem('role');

  return !requiredRole || role === requiredRole
    ? true
    : router.createUrlTree(['/login']);
};
