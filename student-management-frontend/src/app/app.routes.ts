import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';

import { Admin } from './features/admin/admin-dashboard/admin';

import { Teacher } from './features/teacher/teacher-dashboard/teacher';

import { Student } from './features/student/student-dashboard/student/student';

import { authGuard } from './core/guards/auth-guard';

import { roleGuard } from './core/guards/role-guard';

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
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'ADMIN'
    }
  },

  {
    path: 'teacher',
    component: Teacher,
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'TEACHER'
    }
  },

  {
    path: 'student',
    component: Student,
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'STUDENT'
    }
  }

];