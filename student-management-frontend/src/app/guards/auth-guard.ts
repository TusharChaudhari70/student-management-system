import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Not logged in
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  // Check required role
  const requiredRole = route.data['role'];

  if (requiredRole && role !== requiredRole) {
    return router.createUrlTree(['/login']);
  }

  return true;
};