
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  errorMessage = '';
  loading = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  login(): void {

    // Clear previous error
    this.errorMessage = '';

    // Username validation
    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    // Password validation
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }

    // Start loading
    this.loading = true;

    const loginData = {
      username: this.username.trim(),
      password: this.password
    };

    this.authService.login(loginData).subscribe({

      // SUCCESS
      next: (response) => {

        console.log('Login successful:', response);

        // Stop loading immediately
        this.loading = false;
        this.cdr.detectChanges();

        if (!response || !response.token) {
          this.errorMessage = 'Invalid username or password';
          return;
        }

        // Store login information
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);

        // Allow ADMIN only
        if (response.role === 'ADMIN') {

          this.router.navigate(['/admin']);

        } else {

          // Remove unauthorized login information
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');

          this.errorMessage =
            'Access denied: You do not have permission to access this page.';
        }
      },

      // ERROR
      error: (error) => {

        console.error('Login error:', error);

        this.loading = false;

        if (
          error?.status === 400 ||
          error?.status === 401 ||
          error?.status === 403
        ) {

          this.errorMessage = 'Invalid username or password';

        } else if (error?.status === 0) {

          this.errorMessage =
            'Unable to connect to server. Please make sure the backend is running.';

        } else {

          this.errorMessage =
            'Something went wrong. Please try again.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  // Remove old error when user starts typing again
  clearError(): void {
    this.errorMessage = '';
  }
}
