import { Component } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-teacher',
  imports: [],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher {

  username = localStorage.getItem('username');
  role = localStorage.getItem('role');

  constructor(private authService: Auth) {}

  logout() {
    this.authService.logout();
  }
}