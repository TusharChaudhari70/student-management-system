import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Teacher } from '../../../../shared/models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-form.html',
  styleUrl: './teacher-form.css'
})
export class TeacherForm {
  @Input({ required: true }) teacher!: Partial<Teacher>;
  @Input() includePassword = false;
  @Input() submitLabel = 'Save Teacher';
  @Input() formName = 'teacherForm';
  @Output() submitted = new EventEmitter<NgForm>();
  @Output() cancelled = new EventEmitter<NgForm>();
}
