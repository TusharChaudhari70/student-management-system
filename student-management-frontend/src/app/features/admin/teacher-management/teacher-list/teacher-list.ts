import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Teacher } from '../../../../shared/models/teacher.model';
import { HighlightMatchPipe } from '../../../../shared/pipes/highlight-match.pipe';
import { SelectModule } from 'primeng/select';

export type TeacherField = 'id' | 'username' | 'name' | 'email' | 'role';
export type TeacherSearchField = 'all' | TeacherField;

@Component({
  selector: 'app-teacher-list',
  imports: [FormsModule, HighlightMatchPipe, SelectModule],
  templateUrl: './teacher-list.html',
  styleUrl: './teacher-list.scss'
})
export class TeacherList {
  @Input() teachers: Teacher[] = [];
  @Input() loading = false;
  @Output() edit = new EventEmitter<Teacher>();
  @Output() remove = new EventEmitter<Teacher>();

  searchTerm = '';
  searchField: TeacherSearchField = 'all';
  readonly searchFieldOptions = [
    { label: 'All Fields', value: 'all' },
    { label: 'ID', value: 'id' },
    { label: 'Username', value: 'username' },
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Role', value: 'role' }
  ];
  columnFilters: Record<TeacherField, string> = { id: '', username: '', name: '', email: '', role: '' };
  sortField: TeacherField = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  pageSize = 5;
  currentPage = 1;

  get filteredTeachers(): Teacher[] {
    const term = this.searchTerm.trim().toLowerCase();
    const result = (term
      ? this.teachers.filter(teacher => this.valueFor(teacher, this.searchField).includes(term))
      : [...this.teachers]).filter(teacher => (Object.keys(this.columnFilters) as TeacherField[])
        .every(field => !this.columnFilters[field] || (field === 'id'
          ? this.valueFor(teacher, field) === this.columnFilters[field]
          : this.valueFor(teacher, field).includes(this.columnFilters[field]))));

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
  clearSearch(): void { this.searchTerm = ''; this.currentPage = 1; }
  changeSearchField(field: TeacherSearchField): void { this.searchField = field; this.currentPage = 1; }
  setColumnFilter(field: TeacherField, value: string): void { this.columnFilters[field] = value.trim().toLowerCase(); this.currentPage = 1; }
  toggleSort(field: TeacherField): void { this.sortDirection = this.sortField === field && this.sortDirection === 'asc' ? 'desc' : 'asc'; this.sortField = field; this.currentPage = 1; }
  changePageSize(value: string): void { this.pageSize = Number(value); this.currentPage = 1; }
  previous(): void { this.currentPage = Math.max(1, this.currentPage - 1); }
  next(): void { this.currentPage = Math.min(this.totalPages, this.currentPage + 1); }

  getHighlightTerm(field: TeacherField): string {
    return (this.searchField === 'all' || this.searchField === field) ? this.searchTerm : '';
  }

  private valueFor(teacher: Teacher, field: TeacherSearchField): string {
    if (field === 'all') {
      return `${teacher.id ?? ''} ${teacher.username ?? ''} ${teacher.name ?? ''} ${teacher.email ?? ''} ${teacher.role ?? ''}`.toLowerCase();
    }
    return String(teacher[field] ?? '').toLowerCase();
  }
}
