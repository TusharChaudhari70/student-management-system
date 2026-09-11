import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @Input({ required: true }) title = '';
  @Output() closed = new EventEmitter<void>();
}
