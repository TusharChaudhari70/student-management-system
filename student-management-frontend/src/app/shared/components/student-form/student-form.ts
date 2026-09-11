import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Teacher } from '../../models/teacher.model';

export interface StudentFormValue {
  name: string;
  email: string;
  course: string;
  age: number | null;
}

@Component({
  selector: 'app-student-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css'
})
export class StudentForm {
  @Input({ required: true }) student!: StudentFormValue;
  @Input() teachers: Teacher[] = [];
  @Input() teacherId: number | null = null;
  @Input() showTeacher = false;
  @Input() loadingTeachers = false;
  @Input() submitLabel = 'Save Student';
  @Input() formName = 'studentForm';
  @Output() teacherIdChange = new EventEmitter<number | null>();
  @Output() submitted = new EventEmitter<NgForm>();
  @Output() cancelled = new EventEmitter<NgForm>();
}
