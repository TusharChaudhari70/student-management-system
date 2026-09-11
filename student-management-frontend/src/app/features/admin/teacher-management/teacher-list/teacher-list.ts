import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Teacher } from '../../../../shared/models/teacher.model';
import { HighlightMatchPipe } from '../../../../shared/pipes/highlight-match.pipe';

@Component({
  selector: 'app-teacher-list',
  imports: [HighlightMatchPipe],
  templateUrl: './teacher-list.html',
  styleUrl: './teacher-list.css'
})
export class TeacherList {
  @Input() teachers: Teacher[] = [];
  @Input() loading = false;
  @Output() edit = new EventEmitter<Teacher>();
  @Output() remove = new EventEmitter<Teacher>();

  searchTerm = '';
  searchField: TeacherField = 'name';
  sortField: TeacherField = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  pageSize = 5;
  currentPage = 1;

  get filteredTeachers(): Teacher[] {
    const term = this.searchTerm.trim().toLowerCase();
    const result = term
      ? this.teachers.filter(teacher => this.valueFor(teacher, this.searchField).includes(term))
      : [...this.teachers];

    return result.sort((a, b) => {
      const first = this.valueFor(a, this.sortField);
      const second = this.valueFor(b, this.sortField);
      const comparison = this.sortField === 'id' ? Number(first) - Number(second) : first.localeCompare(second);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredTeachers.length / this.pageSize)); }
  get visibleTeachers(): Teacher[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTeachers.slice(start, start + this.pageSize);
  }

  search(value: string): void { this.searchTerm = value.trim().toLowerCase(); this.currentPage = 1; }
  changeSearchField(field: TeacherField): void { this.searchField = field; this.currentPage = 1; }
  toggleSort(field: TeacherField): void { this.sortDirection = this.sortField === field && this.sortDirection === 'asc' ? 'desc' : 'asc'; this.sortField = field; this.currentPage = 1; }
  changePageSize(value: string): void { this.pageSize = Number(value); this.currentPage = 1; }
  previous(): void { this.currentPage = Math.max(1, this.currentPage - 1); }
  next(): void { this.currentPage = Math.min(this.totalPages, this.currentPage + 1); }
  private valueFor(teacher: Teacher, field: TeacherField): string { return String(teacher[field] ?? '').toLowerCase(); }
}

type TeacherField = 'id' | 'username' | 'name' | 'email' | 'role';
