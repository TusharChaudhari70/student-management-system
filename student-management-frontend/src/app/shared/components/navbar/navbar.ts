import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @Input({ required: true }) username = '';
  @Input({ required: true }) role = '';
  @Output() logoutRequested = new EventEmitter<void>();
}
