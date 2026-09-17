import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Teacher } from '../../models/teacher.model';
import { Subject } from '../../models/subject.model';

export interface StudentFormValue {
  name: string;
  email: string;
  course: string;
  age: number | null;
  username?: string;
  password?: string;
  subjects?: Subject[];
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
  @Input() subjects: Subject[] = [];
  @Input() subjectIds: number[] = [];
  @Input() loadingSubjects = false;
  @Input() submitLabel = 'Save Student';
  @Input() passwordRequired = true;
  @Input() submitting = false;
  @Input() formName = 'studentForm';
  @Output() teacherIdChange = new EventEmitter<number | null>();
  @Output() subjectIdsChange = new EventEmitter<number[]>();
  @Output() submitted = new EventEmitter<NgForm>();
  @Output() cancelled = new EventEmitter<NgForm>();

  toggleSubject(subjectId: number, checked: boolean): void {
    const subjectIds = checked
      ? [...new Set([...this.subjectIds, subjectId])]
      : this.subjectIds.filter(id => id !== subjectId);
    this.subjectIdsChange.emit(subjectIds);
  }
}
