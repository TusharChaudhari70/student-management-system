import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @Input({ required: true }) username = '';
  @Input({ required: true }) role = '';
  @Output() logoutRequested = new EventEmitter<void>();
  @Output() profileRequested = new EventEmitter<void>();
  @Output() dashboardRequested = new EventEmitter<void>();

  constructor(public themeService: ThemeService, public toastService: ToastService, private router: Router) {
    this.toastService.installAlertHandler();
  }

  confirmLogout(): void {
    if (window.confirm('Are you sure you want to log out?')) {
      this.logoutRequested.emit();
    }
  }

  navigateToDashboard(): void {
    this.dashboardRequested.emit();
    const path = this.role === 'ADMIN' ? '/admin' : this.role === 'TEACHER' ? '/teacher' : '/student';
    this.router.navigate([path]);
  }
}
