import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, ButtonModule, InputTextModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  selectedRole: UserRole | null = null; // null = Role selection screen, value = Login form screen
  readonly loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  errorMessage = '';
  loading = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
  ) {}

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.loginForm.reset();
    this.errorMessage = '';
  }

  resetRoleSelection(): void {
    this.selectedRole = null;
    this.loginForm.reset();
    this.errorMessage = '';
  }

  login(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Username or Email and password are required';
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    if (!username.trim()) {
      this.errorMessage = 'Username or Email is required';
      return;
    }

    if (!password) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.loading = true;

    const loginData = {
      username: username.trim(),
      password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        this.cdr.detectChanges();

        if (!response || !response.token) {
          this.errorMessage = 'Invalid username or password';
          return;
        }

        // Validate selected role against actual role if role was explicitly chosen
        if (this.selectedRole && response.role !== this.selectedRole) {
          this.errorMessage = `This account is a ${response.role}, not a ${this.selectedRole}. Please choose ${response.role} to proceed.`;
          return;
        }

        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);

        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else if (response.role === 'TEACHER') {
          this.router.navigate(['/teacher'], { replaceUrl: true });
        } else if (response.role === 'STUDENT') {
          this.router.navigate(['/student'], { replaceUrl: true });
        } else {
          localStorage.clear();
          this.errorMessage = 'Access denied: Unknown role.';
        }
      },
      error: (error) => {
        this.loading = false;
        if (error?.status === 400 || error?.status === 401 || error?.status === 403) {
          this.errorMessage = 'Invalid username or password';
        } else if (error?.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please ensure backend is running.';
        } else {
          this.errorMessage = 'Login failed. Please verify credentials.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
