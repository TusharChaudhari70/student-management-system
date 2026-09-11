import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs'; import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:8080/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

login(data: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${this.apiUrl}/login`,
    data,
    {
      timeout: 10000
    }
  );
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}