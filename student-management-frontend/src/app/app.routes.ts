import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Admin } from './components/admin/admin';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    data: {
      role: 'ADMIN'
    }
  }

];