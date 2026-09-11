import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { Auth } from '../../../core/services/auth';
import {
  Student,
  StudentService
} from '../../../services/student.service';
import { Teacher as TeacherModel, TeacherService } from '../../../services/teacher.service';
import { StudentList } from '../../../shared/components/student-list/student-list';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { StudentForm } from '../../../shared/components/student-form/student-form';

@Component({
  selector: 'app-teacher',
  imports: [
    FormsModule,
    StudentList,
    Navbar,
    StudentForm
  ],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher implements OnInit {

  username = localStorage.getItem('username');
  role = localStorage.getItem('role');

  selectedSection = 'dashboard';
  selectedStudentAction = '';

  // Profile data
  profile: TeacherModel | null = null;
  loadingProfile = false;

  // Student Add
  newStudent = {
    name: '',
    email: '',
    course: '',
    age: null as number | null
  };

  // Student Update
  selectedStudentForUpdate: Student | null = null;
  showStudentUpdateModal = false;
  updateStudent = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  // Student Delete
  selectedStudentForDelete: Student | null = null;
  showStudentDeleteModal = false;
  deleteStudent = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  // Refresh StudentList
  studentListRefreshKey = 0;

  constructor(
    private authService: Auth,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // Logout
  logout(): void {
    this.authService.logout();
  }

  // Section Navigation
  selectSection(section: string): void {
    if (this.selectedSection === section && section !== 'dashboard') {
      this.selectedSection = 'dashboard';
      this.selectedStudentAction = '';
      return;
    }

    this.selectedSection = section;
    this.selectedStudentAction = '';

    if (section === 'profile' && !this.profile) {
      this.loadProfile();
    }
  }

  selectStudentAction(action: string): void {
    this.selectedSection = 'students';
    this.selectedStudentAction = action;
  }

  // Load Profile
  loadProfile(): void {
    this.loadingProfile = true;
    this.teacherService
      .getProfile()
      .pipe(
        finalize(() => {
          this.loadingProfile = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching teacher profile:', err);
        }
      });
  }

  // Add Student (Teacher assigns to self automatically)
  addStudent(form: NgForm): void {
    if (form.invalid || !this.newStudent.age || this.newStudent.age <= 0) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    const studentToAdd: Student = {
      name: this.newStudent.name,
      email: this.newStudent.email,
      course: this.newStudent.course,
      age: this.newStudent.age
    };

    this.studentService.addStudent(studentToAdd).subscribe({
      next: () => {
        alert('Student created and assigned to you successfully.');
        form.resetForm({
          name: '',
          email: '',
          course: '',
          age: null
        });
        this.clearStudentForm();
        this.studentListRefreshKey++;
        this.selectedStudentAction = 'list';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding student:', error);
        alert(error.error?.message || 'Failed to add student.');
      }
    });
  }

  cancelAddStudent(form: NgForm): void {
    form.resetForm({
      name: '',
      email: '',
      course: '',
      age: null
    });
    this.clearStudentForm();
    this.selectedStudentAction = '';
  }

  clearStudentForm(): void {
    this.newStudent = {
      name: '',
      email: '',
      course: '',
      age: null
    };
  }

  // Update Modal
  openStudentUpdateModal(student: Student): void {
    if (!student.id) {
      alert('Invalid student ID.');
      return;
    }

    this.selectedStudentForUpdate = student;
    this.updateStudent = {
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age
    };

    this.showStudentUpdateModal = true;
    this.cdr.detectChanges();
  }

  closeStudentUpdateModal(): void {
    this.showStudentUpdateModal = false;
    this.selectedStudentForUpdate = null;
    this.updateStudent = {
      name: '',
      email: '',
      course: '',
      age: 0
    };
    this.cdr.detectChanges();
  }

  saveStudentFromModal(form: NgForm): void {
    if (!this.selectedStudentForUpdate?.id) {
      alert('Student information is not available.');
      return;
    }

    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    const studentId = this.selectedStudentForUpdate.id;
    const studentData: Student = {
      name: this.updateStudent.name,
      email: this.updateStudent.email,
      course: this.updateStudent.course,
      age: this.updateStudent.age
    };

    this.studentService.updateStudent(studentId, studentData).subscribe({
      next: () => {
        alert('Student updated successfully.');
        this.closeStudentUpdateModal();
        this.studentListRefreshKey++;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Update error:', error);
        alert(error.error?.message || 'Failed to update student.');
      }
    });
  }

  // Delete Modal
  openStudentDeleteModal(student: Student): void {
    if (!student.id) {
      alert('Invalid student ID.');
      return;
    }

    this.selectedStudentForDelete = student;
    this.deleteStudent = {
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age
    };

    this.showStudentDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeStudentDeleteModal(): void {
    this.showStudentDeleteModal = false;
    this.selectedStudentForDelete = null;
    this.cdr.detectChanges();
  }

  confirmStudentDeleteFromModal(): void {
    if (!this.selectedStudentForDelete?.id) {
      alert('Student information is not available.');
      return;
    }

    const studentId = this.selectedStudentForDelete.id;

    this.studentService.deleteStudent(studentId).subscribe({
      next: () => {
        alert('Student soft-deleted successfully.');
        this.closeStudentDeleteModal();
        this.studentListRefreshKey++;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Delete error:', error);
        alert(error.error?.message || 'Failed to delete student.');
      }
    });
  }
}
