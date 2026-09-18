import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { HighlightMatchPipe } from '../../pipes/highlight-match.pipe';
import { SelectModule } from 'primeng/select';

import {
  Student,
  StudentService
} from '../../../services/student.service';

export type StudentField = 'id' | 'name' | 'email' | 'course' | 'age' | 'teacher';
export type StudentSearchField = 'all' | StudentField;

@Component({
  selector: 'app-student-list',
  imports: [AsyncPipe, FormsModule, HighlightMatchPipe, SelectModule],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList implements OnChanges {

  @Input() refreshKey = 0;
  @Input() canDelete = false;

  students$: Observable<Student[]>;

  @Output() updateStudent = new EventEmitter<Student>();
  @Output() deleteStudent = new EventEmitter<Student>();

  searchField: StudentSearchField = 'all'; // Field selected for search
  readonly searchFieldOptions = [
    { label: 'All Fields', value: 'all' },
    { label: 'ID', value: 'id' },
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Course', value: 'course' },
    { label: 'Age', value: 'age' },
    { label: 'Teacher', value: 'teacher' }
  ];
  searchTerm = ''; // Current search query
  columnFilters: Record<StudentField, string> = { id: '', name: '', email: '', course: '', age: '', teacher: '' };

  sortField: StudentField = 'id'; // Currently sorted column
  sortAscending = true; // Sort direction

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
    this.students$ = this.studentService.getAllStudents();
    this.currentPage = 1;
  }

  changeSearchField(field: StudentSearchField): void {
    this.searchField = field;
    this.currentPage = 1;
  }

  onSearch(value: string): void {
    this.searchTerm = value.trim().toLowerCase();
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
  }

  setColumnFilter(field: StudentField, value: string): void { this.columnFilters[field] = value.trim().toLowerCase(); this.currentPage = 1; }
  applyColumnFilters(filters: Record<StudentField, string>): void {
    this.columnFilters = Object.fromEntries(Object.entries(filters).map(([field, value]) => [field, value.trim().toLowerCase()])) as Record<StudentField, string>;
    this.currentPage = 1;
  }

  sortBy(field: StudentField): void {
    if (this.sortField === field) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortField = field;
      this.sortAscending = true;
    }
    this.currentPage = 1;
  }

  getFilteredStudents(students: Student[]): Student[] {
    const activeStudents = students.filter(s => !s.isDeleted);
    const globalMatches = !this.searchTerm ? activeStudents : activeStudents.filter(student => {
      if (this.searchField === 'all') {
        const fullText = `${student.id ?? ''} ${student.name ?? ''} ${student.email ?? ''} ${student.course ?? ''} ${student.age ?? ''} ${student.teacher?.name ?? ''} ${student.teacher?.username ?? ''}`.toLowerCase();
        return fullText.includes(this.searchTerm);
      }
      return this.getFieldValue(student, this.searchField).includes(this.searchTerm);
    });

    return globalMatches.filter(student => (Object.keys(this.columnFilters) as StudentField[])
      .every(field => !this.columnFilters[field] || (field === 'id'
        ? this.getFieldValue(student, field) === this.columnFilters[field]
        : this.getFieldValue(student, field).includes(this.columnFilters[field]))));
  }

  getSortedStudents(students: Student[]): Student[] {
    const sorted = [...students];

    sorted.sort((a, b) => {
      const valA = this.getFieldValue(a, this.sortField);
      const valB = this.getFieldValue(b, this.sortField);

      const comparison = (this.sortField === 'id' || this.sortField === 'age')
        ? Number(valA) - Number(valB)
        : valA.localeCompare(valB);

      return this.sortAscending ? comparison : -comparison;
    });

    return sorted;
  }

  getPaginatedStudents(students: Student[]): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return students.slice(start, start + this.pageSize);
  }

  getTotalPages(students: Student[]): number {
    return Math.max(1, Math.ceil(students.length / this.pageSize));
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  nextPage(totalPages: number): void {
    if (this.currentPage < totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onUpdate(student: Student): void {
    this.updateStudent.emit(student);
  }

  onDelete(student: Student): void {
    if (!this.canDelete) {
      alert('You are not authorized to delete students.');
      return;
    }
    this.deleteStudent.emit(student);
  }

  getHighlightTerm(field: StudentField): string {
    return (this.searchField === 'all' || this.searchField === field) ? this.searchTerm : '';
  }

  private getFieldValue(student: Student, field: StudentField): string {
    if (field === 'teacher') {
      return `${student.teacher?.name || ''} ${student.teacher?.username || ''}`.trim().toLowerCase();
    }
    return String(student[field] ?? '').toLowerCase();
  }
}
