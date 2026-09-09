import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
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
export class StudentList implements OnChanges {

  @Input() refreshKey = 0;

  students$: Observable<Student[]>;

  @Output() updateStudent = new EventEmitter<Student>();
  @Output() deleteStudent = new EventEmitter<Student>();

  // Search
  searchText = '';

  // Sorting
  sortAscending = true;

  // Pagination
  currentPage = 1;
  pageSize = 5;

  constructor(private studentService: StudentService) {
    this.students$ = this.studentService.getAllStudents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey'] && !changes['refreshKey'].firstChange) {
      this.refresh();
    }
  }

  refresh(): void {
    console.log('Refreshing student table...');
    this.students$ = this.studentService.getAllStudents();
    this.currentPage = 1;
  }

  // ================================
  // SEARCH
  // ================================

  onSearch(value: string): void {
    this.searchText = value.trim().toLowerCase();

    // Start from first page whenever search changes
    this.currentPage = 1;
  }

  // ================================
  // SORT BY ID
  // ================================

  sortById(): void {
    this.sortAscending = !this.sortAscending;
    this.currentPage = 1;
  }

  // ================================
  // FILTER STUDENTS
  // ================================

  getFilteredStudents(students: Student[]): Student[] {

    if (!this.searchText) {
      return students;
    }

    return students.filter(student =>
      student.name?.toLowerCase().startsWith(this.searchText)
    );
  }

  // ================================
  // SORT STUDENTS
  // ================================

  getSortedStudents(students: Student[]): Student[] {

    const sortedStudents = [...students];

    sortedStudents.sort((a, b) => {

      const idA = a.id ?? 0;
      const idB = b.id ?? 0;

      return this.sortAscending
        ? idA - idB
        : idB - idA;
    });

    return sortedStudents;
  }

  // ================================
  // PAGINATION
  // ================================

  getPaginatedStudents(students: Student[]): Student[] {

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    return students.slice(startIndex, endIndex);
  }

  getTotalPages(students: Student[]): number {

    return Math.ceil(
      students.length / this.pageSize
    );
  }

  // ================================
  // CHANGE PAGE SIZE
  // ================================

  changePageSize(size: number): void {

    this.pageSize = size;
    this.currentPage = 1;
  }

  // ================================
  // NEXT PAGE
  // ================================

  nextPage(totalPages: number): void {

    if (this.currentPage < totalPages) {
      this.currentPage++;
    }
  }

  // ================================
  // PREVIOUS PAGE
  // ================================

  previousPage(): void {

    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ================================
  // UPDATE
  // ================================

  onUpdate(student: Student): void {
    this.updateStudent.emit(student);
  }

  // ================================
  // DELETE
  // ================================

  onDelete(student: Student): void {
    this.deleteStudent.emit(student);
  }
}