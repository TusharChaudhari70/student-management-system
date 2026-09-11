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
import { HighlightMatchPipe } from '../../pipes/highlight-match.pipe';

import {
  Student,
  StudentService
} from '../../../services/student.service';

@Component({
  selector: 'app-student-list',
  imports: [AsyncPipe, HighlightMatchPipe],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css'
})
export class StudentList implements OnChanges {

  @Input() refreshKey = 0;
  @Input() canDelete = false;

  students$: Observable<Student[]>;

  @Output() updateStudent = new EventEmitter<Student>();
  @Output() deleteStudent = new EventEmitter<Student>();

  // Search
  searchText = '';
  searchField: StudentField = 'name';

  // Sorting
  sortField: StudentField = 'id';
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

  onSearchFieldChange(field: StudentField): void {
    this.searchField = field;
    this.currentPage = 1;
  }

  // ================================
  // SORT BY ID
  // ================================

  sortBy(field: StudentField): void {
    this.sortAscending = this.sortField === field ? !this.sortAscending : true;
    this.sortField = field;
    this.currentPage = 1;
  }

  // ================================
  // FILTER STUDENTS
  // ================================

  getFilteredStudents(students: Student[]): Student[] {

    const activeStudents = students.filter(student => !student.isDeleted);

    if (!this.searchText) {
      return activeStudents;
    }

    return activeStudents.filter(student =>
      this.getFieldValue(student, this.searchField).includes(this.searchText)
    );
  }

  // ================================
  // SORT STUDENTS
  // ================================

  getSortedStudents(students: Student[]): Student[] {

    const sortedStudents = [...students];

    sortedStudents.sort((a, b) => {

      const valueA = this.getFieldValue(a, this.sortField);
      const valueB = this.getFieldValue(b, this.sortField);
      const comparison = this.sortField === 'id' || this.sortField === 'age'
        ? Number(valueA) - Number(valueB)
        : valueA.localeCompare(valueB);
      return this.sortAscending ? comparison : -comparison;
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
    if (!this.canDelete) {
      alert('You are not authorized to delete students.');
      return;
    }
    this.deleteStudent.emit(student);
  }

  private getFieldValue(student: Student, field: StudentField): string {
    if (field === 'teacher') return `${student.teacher?.name || ''} ${student.teacher?.username || ''}`.toLowerCase();
    return String(student[field] ?? '').toLowerCase();
  }
  
}

type StudentField = 'id' | 'name' | 'email' | 'course' | 'age' | 'teacher';
