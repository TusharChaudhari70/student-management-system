import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirmation-modal',
  imports: [Modal],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css'
})
export class ConfirmationModal {
  @Input({ required: true }) title = 'Confirm action';
  @Input({ required: true }) message = '';
  @Input() confirmLabel = 'Confirm';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
