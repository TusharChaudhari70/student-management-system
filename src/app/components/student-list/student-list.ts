import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

import {
  Student,
  StudentService
} from '../../services/student.service';

@Component({
  selector: 'app-student-list',
  imports: [AsyncPipe],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css'
})
export class StudentList {

  students$: Observable<Student[]>;

  constructor(private studentService: StudentService) {
    this.students$ = this.studentService.getAllStudents();
  }

}