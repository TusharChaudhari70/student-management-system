import { Component } from '@angular/core';
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
    private router: Router
  ) {}

  login() {

    this.errorMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.loading = true;

    const loginData = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginData).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        // Store authentication information
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);

        this.loading = false;

        // ADMIN only
        if (response.role === 'ADMIN') {

          this.router.navigate(['/admin']);

        } else {

          this.errorMessage = 'Access denied: Invalid role';
          
        }

      },

      error: (error) => {

        console.error('Login error:', error);

        this.loading = false;
        this.errorMessage = 'Invalid username or password';

      }

    });

  }

}