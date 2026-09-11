import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { Auth } from '../../../core/services/auth';
import {
  Student,
  StudentService
} from '../../../services/student.service';
import { Teacher, TeacherService } from '../../../services/teacher.service';
import { StudentList } from '../../../shared/components/student-list/student-list';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { StudentForm } from '../../../shared/components/student-form/student-form';
import { TeacherForm } from '../teacher-management/teacher-form/teacher-form';
import { TeacherList } from '../teacher-management/teacher-list/teacher-list';

@Component({
  selector: 'app-admin',
  imports: [
    FormsModule,
    StudentList,
    Navbar,
    StudentForm,
    TeacherForm,
    TeacherList
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  username = localStorage.getItem('username');
  role = localStorage.getItem('role');

  selectedSection = 'dashboard';
  selectedStudentAction = '';
  selectedTeacherAction = '';

  // Student add
  newStudent = {
    name: '',
    email: '',
    course: '',
    age: 0,
    teacher: null as { id: number } | null
  };

  teachers: Teacher[] = [];
  selectedTeacherId: number | null = null;
  loadingTeachers = false;

  // Student update
  updateStudentId: number | null = null;
  searchedStudentId: number | null = null;

  selectedStudentForUpdate: Student | null = null;
  selectedStudentForDelete: Student | null = null;

  showStudentUpdateModal = false;
  showStudentDeleteModal = false;

  // Used to refresh StudentList after CRUD operations
  studentListRefreshKey = 0;

  updateStudent = {
    name: '',
    email: '',
    course: '',
    age: 0,
    teacher: null as { id: number } | null
  };

  selectedUpdateTeacherId: number | null = null;
  searchingStudent = false;
  studentFound = false;


  // Student delete
  deleteStudentId: number | null = null;
  searchedDeleteStudentId: number | null = null;

  deleteStudent = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  searchingDeleteStudent = false;
  deleteStudentFound = false;

  // Teacher add
  newTeacher = {
    username: '',
    name: '',
    email: '',
    password: ''
  };

  teacherList: Teacher[] = [];
  loadingTeacherList = false;

  // =========================================================
  // NEW TEACHER TABLE CONTROLS
  // =========================================================

  teacherSearchTerm = '';
  teacherSortDirection: 'asc' | 'desc' = 'asc';
  teacherPageSize = 5;
  teacherCurrentPage = 1;

  // =========================================================
  // NEW TEACHER UPDATE / DELETE MODAL STATE
  // =========================================================

  selectedTeacherForUpdate: Teacher | null = null;
  selectedTeacherForDelete: Teacher | null = null;

  showTeacherUpdateModal = false;
  showTeacherDeleteModal = false;

  modalTeacher = {
    username: '',
    name: '',
    email: ''
  };

  // Teacher update
  updateTeacherId: number | null = null;
  searchedTeacherId: number | null = null;

  updateTeacher = {
    username: '',
    name: '',
    email: ''
  };

  searchingTeacher = false;
  teacherFound = false;

  // Teacher delete
  deleteTeacherId: number | null = null;
  searchedDeleteTeacherId: number | null = null;

  deleteTeacher = {
    username: '',
    name: '',
    email: ''
  };

  searchingDeleteTeacher = false;
  deleteTeacherFound = false;

  constructor(
    private authService: Auth,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef
  ) { }

  // Logout
  logout() {
    this.authService.logout();
  }

  // Controls the main dashboard sections.
  selectSection(section: string) {

    if (section === 'students') {

      if (this.selectedSection === 'students') {
        this.selectedSection = '';
        this.selectedStudentAction = '';

        this.resetUpdate();
        this.resetDelete();

        return;
      }

      this.selectedSection = 'students';
      this.selectedStudentAction = '';
      this.selectedTeacherAction = '';

      this.resetUpdate();
      this.resetDelete();
      this.resetTeacherUpdate();
      this.resetTeacherDelete();

      return;
    }

    if (section === 'teachers') {

      if (this.selectedSection === 'teachers') {
        this.selectedSection = '';
        this.selectedTeacherAction = '';

        this.resetTeacherUpdate();
        this.resetTeacherDelete();

        this.closeTeacherUpdateModal();
        this.closeTeacherDeleteModal();

        return;
      }

      this.selectedSection = 'teachers';
      this.selectedTeacherAction = '';
      this.selectedStudentAction = '';

      this.resetUpdate();
      this.resetDelete();
      this.resetTeacherUpdate();
      this.resetTeacherDelete();

      this.closeTeacherUpdateModal();
      this.closeTeacherDeleteModal();

      this.loadTeacherList();

      return;
    }

    this.selectedSection = section;
    this.selectedStudentAction = '';
    this.selectedTeacherAction = '';

    this.resetUpdate();
    this.resetDelete();
    this.resetTeacherUpdate();
    this.resetTeacherDelete();

    this.closeTeacherUpdateModal();
    this.closeTeacherDeleteModal();
  }

  // Controls student CRUD operations.
  selectStudentAction(action: string) {

    if (
      this.selectedSection === 'students' &&
      this.selectedStudentAction === action
    ) {
      this.selectedStudentAction = '';

      this.resetUpdate();
      this.resetDelete();

      return;
    }

    this.selectedSection = 'students';
    this.selectedStudentAction = action;
    this.selectedTeacherAction = '';

    this.resetUpdate();
    this.resetDelete();

    if (action === 'add' || action === 'update') {
      this.loadTeachers();
    }
  }

  // Controls teacher CRUD operations.
  selectTeacherAction(action: string) {

    if (
      this.selectedSection === 'teachers' &&
      this.selectedTeacherAction === action
    ) {
      this.selectedTeacherAction = '';

      this.resetTeacherUpdate();
      this.resetTeacherDelete();

      return;
    }

    this.selectedSection = 'teachers';
    this.selectedTeacherAction = action;
    this.selectedStudentAction = '';

    this.resetTeacherUpdate();
    this.resetTeacherDelete();

    if (action === 'view') {
      this.loadTeacherList();
    }
  }

  // Loads teachers used in the student add/update forms.
  loadTeachers() {

    this.loadingTeachers = true;

    this.teacherService
      .getAllTeachers()
      .pipe(
        finalize(() => {
          this.loadingTeachers = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (teachers) => {
          console.log('Teachers received from DB:', teachers);

          this.teachers = teachers;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error loading teachers:', error);

          this.teachers = [];

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert('You are not authorized to load teachers.');
          } else {
            alert('Failed to load teachers.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Adds a new student through StudentService.
  addStudent(form: NgForm) {

    if (
      form.invalid ||
      this.selectedTeacherId === null
    ) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });

      return;
    }

    const studentToAdd = {
      ...this.newStudent,
      isDeleted: false,
      teacher: {
        id: this.selectedTeacherId
      }
    };

    this.studentService
      .addStudent(studentToAdd)
      .subscribe({

        next: (response) => {
          console.log('Student added:', response);

          alert('Student added successfully');

          form.resetForm({
            name: '',
            email: '',
            course: '',
            age: 0,
            teacher: null
          });

          this.clearStudentForm();
          this.selectedTeacherId = null;

          // Refresh student table
          this.studentListRefreshKey++;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error adding student:', error);

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert('You are not authorized to add students.');
          } else if (error.status === 400) {
            alert(
              error.error?.message ||
              'Invalid student data.'
            );
          } else {
            alert('Failed to add student.');
          }
        }

      });
  }

  // Cancels the add-student operation and clears the form.
  cancelAddStudent(form: NgForm) {

    form.resetForm({
      name: '',
      email: '',
      course: '',
      age: 0,
      teacher: null
    });

    this.clearStudentForm();
    this.selectedStudentAction = '';
  }

  clearStudentForm() {

    this.newStudent = {
      name: '',
      email: '',
      course: '',
      age: 0,
      teacher: null
    };

    this.selectedTeacherId = null;
  }

  // Finds a student and loads its data into the update form.
  findStudentForUpdate() {

    if (
      this.updateStudentId === null ||
      this.updateStudentId <= 0
    ) {
      alert('Please enter a valid student ID.');
      return;
    }

    const studentId = this.updateStudentId;

    this.searchingStudent = true;
    this.studentFound = false;
    this.searchedStudentId = null;

    this.clearUpdateStudent();
    this.selectedUpdateTeacherId = null;

    this.loadTeachers();
    this.cdr.detectChanges();

    this.studentService
      .getStudentById(studentId)
      .pipe(
        finalize(() => {
          this.searchingStudent = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (student) => {

          if (!student) {
            this.studentFound = false;
            this.searchedStudentId = null;

            this.clearUpdateStudent();

            alert(
              `Student with ID ${studentId} does not exist.`
            );

            this.cdr.detectChanges();
            return;
          }

          this.searchedStudentId = student.id ?? null;

          this.updateStudent = {
            name: student.name,
            email: student.email,
            course: student.course,
            age: student.age,
            teacher: student.teacher
              ? {
                id: student.teacher.id
              }
              : null
          };

          this.selectedUpdateTeacherId =
            student.teacher?.id ?? null;

          this.studentFound = true;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('UPDATE SEARCH ERROR:', error);

          this.studentFound = false;
          this.searchedStudentId = null;

          this.clearUpdateStudent();
          this.selectedUpdateTeacherId = null;

          if (error.status === 404) {
            alert(
              `Student with ID ${studentId} does not exist.`
            );
          } else if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to access this student.'
            );
          } else {
            alert('Failed to fetch student.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Sends the updated student data to the backend.
  updateExistingStudent(form: NgForm) {

    if (
      this.searchedStudentId === null ||
      !this.studentFound
    ) {
      alert('Please search for a student first.');
      return;
    }

    if (this.selectedUpdateTeacherId === null) {
      alert('Please select a teacher.');
      return;
    }

    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });

      return;
    }

    const confirmUpdate = confirm(
      'Do you want to update this particular student?'
    );

    if (!confirmUpdate) {
      return;
    }

    const studentId = this.searchedStudentId;

    const studentData = {
      name: this.updateStudent.name,
      email: this.updateStudent.email,
      course: this.updateStudent.course,
      age: this.updateStudent.age,
      teacher: {
        id: this.selectedUpdateTeacherId
      }
    };

    this.studentService
      .updateStudent(studentId, studentData)
      .subscribe({

        next: (response) => {
          console.log('Student updated:', response);

          alert('Student updated successfully.');

          this.closeStudentUpdateModal();

          this.studentListRefreshKey++;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('UPDATE ERROR:', error);

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to update this student.'
            );
          } else if (error.status === 404) {
            alert('Student not found.');
          } else if (error.status === 400) {
            alert(
              error.error?.message ||
              'Invalid student data.'
            );
          } else {
            alert('Failed to update student.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  clearUpdateStudent() {

    this.updateStudent = {
      name: '',
      email: '',
      course: '',
      age: 0,
      teacher: null
    };

    this.selectedUpdateTeacherId = null;
  }

  resetUpdate() {

    this.updateStudentId = null;
    this.searchedStudentId = null;
    this.studentFound = false;
    this.searchingStudent = false;

    this.clearUpdateStudent();
    this.selectedUpdateTeacherId = null;
  }

  // Opens the student update popup from the student table.
  openStudentUpdateModal(student: Student) {

    if (
      student.id === null ||
      student.id === undefined
    ) {
      alert('Invalid student ID.');
      return;
    }

    this.selectedStudentForUpdate = student;

    this.searchedStudentId = student.id;
    this.studentFound = true;

    this.updateStudent = {
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age,
      teacher: student.teacher
        ? {
          id: student.teacher.id
        }
        : null
    };

    this.selectedUpdateTeacherId =
      student.teacher?.id ?? null;

    this.showStudentUpdateModal = true;

    this.loadTeachers();

    this.cdr.detectChanges();
  }

  // Closes the student update popup.
  closeStudentUpdateModal() {

    this.showStudentUpdateModal = false;
    this.selectedStudentForUpdate = null;

    this.resetUpdate();

    this.cdr.detectChanges();
  }

  // Saves student changes from the popup.
  saveStudentFromModal(form: NgForm) {

    if (
      this.searchedStudentId === null ||
      !this.studentFound
    ) {
      alert('Student information is not available.');
      return;
    }

    if (this.selectedUpdateTeacherId === null) {
      alert('Please select a teacher.');
      return;
    }

    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });

      return;
    }

    const studentId = this.searchedStudentId;

    const studentData = {
      name: this.updateStudent.name,
      email: this.updateStudent.email,
      course: this.updateStudent.course,
      age: this.updateStudent.age,
      teacher: {
        id: this.selectedUpdateTeacherId
      }
    };

    this.studentService
      .updateStudent(studentId, studentData)
      .subscribe({

        next: (response) => {

          console.log('Student updated:', response);

          alert('Student updated successfully.');

          this.closeStudentUpdateModal();

          // Refresh student table
          this.studentListRefreshKey++;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('UPDATE ERROR:', error);

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to update this student.'
            );
          } else if (error.status === 404) {
            alert('Student not found.');
          } else if (error.status === 400) {
            alert(
              error.error?.message ||
              'Invalid student data.'
            );
          } else {
            alert('Failed to update student.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Opens the student delete popup from the student table.
  openStudentDeleteModal(student: Student) {

    if (
      student.id === null ||
      student.id === undefined
    ) {
      alert('Invalid student ID.');
      return;
    }

    this.selectedStudentForDelete = student;

    this.searchedDeleteStudentId = student.id;

    this.deleteStudent = {
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age
    };

    this.deleteStudentFound = true;
    this.showStudentDeleteModal = true;

    this.cdr.detectChanges();
  }

  // Closes the student delete popup.
  closeStudentDeleteModal() {

    this.showStudentDeleteModal = false;
    this.selectedStudentForDelete = null;

    this.resetDelete();

    this.cdr.detectChanges();
  }

  // Confirms deletion from the student popup.
  confirmStudentDeleteFromModal() {

    if (
      this.searchedDeleteStudentId === null ||
      !this.deleteStudentFound
    ) {
      alert('Student information is not available.');
      return;
    }

    const studentId = this.searchedDeleteStudentId;

    this.studentService
      .deleteStudent(studentId)
      .subscribe({

        next: () => {

          alert('Student deleted successfully.');

          this.closeStudentDeleteModal();

          // Refresh student table
          this.studentListRefreshKey++;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('DELETE ERROR:', error);

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to delete this student.'
            );
          } else if (error.status === 404) {
            alert('Student not found.');
          } else {
            alert('Failed to delete student.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Finds a student before allowing deletion.
  findStudentForDelete() {

    if (
      this.deleteStudentId === null ||
      this.deleteStudentId <= 0
    ) {
      alert('Please enter a valid student ID.');
      return;
    }

    const studentId = this.deleteStudentId;

    this.searchingDeleteStudent = true;
    this.deleteStudentFound = false;
    this.searchedDeleteStudentId = null;

    this.clearDeleteStudent();
    this.cdr.detectChanges();

    this.studentService
      .getStudentById(studentId)
      .pipe(
        finalize(() => {
          this.searchingDeleteStudent = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (student) => {

          if (!student) {
            this.deleteStudentFound = false;
            this.searchedDeleteStudentId = null;

            this.clearDeleteStudent();

            alert(
              `Student with ID ${studentId} does not exist.`
            );

            this.cdr.detectChanges();
            return;
          }

          this.searchedDeleteStudentId =
            student.id ?? null;

          this.deleteStudent = {
            name: student.name,
            email: student.email,
            course: student.course,
            age: student.age
          };

          this.deleteStudentFound = true;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('DELETE SEARCH ERROR:', error);

          this.deleteStudentFound = false;
          this.searchedDeleteStudentId = null;

          this.clearDeleteStudent();

          if (error.status === 404) {
            alert(
              `Student with ID ${studentId} does not exist.`
            );
          } else if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to access this student.'
            );
          } else {
            alert('Failed to fetch student.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Deletes the selected student after confirmation.
  deleteExistingStudent() {

    if (
      this.searchedDeleteStudentId === null ||
      !this.deleteStudentFound
    ) {
      alert('Please search for a student first.');
      return;
    }

    const confirmDelete = confirm(
      'Do you want to delete this particular student?'
    );

    if (!confirmDelete) {
      return;
    }

    const studentId = this.searchedDeleteStudentId;

    this.studentService
      .deleteStudent(studentId)
      .subscribe({

        next: () => {
          alert('Student deleted successfully.');

          this.closeStudentDeleteModal();

          this.studentListRefreshKey++;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('DELETE ERROR:', error);

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to delete this student.'
            );
          } else if (error.status === 404) {
            alert('Student not found.');
          } else {
            alert('Failed to delete student.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  clearDeleteStudent() {

    this.deleteStudent = {
      name: '',
      email: '',
      course: '',
      age: 0
    };
  }

  resetDelete() {

    this.deleteStudentId = null;
    this.searchedDeleteStudentId = null;
    this.deleteStudentFound = false;
    this.searchingDeleteStudent = false;

    this.clearDeleteStudent();
  }

  // Adds a new teacher through TeacherService.
  addTeacher(form: NgForm) {

    if (form.invalid) {

      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });

      return;
    }

    const teacherToAdd: Teacher = {
      username: this.newTeacher.username,
      name: this.newTeacher.name,
      email: this.newTeacher.email,
      role: 'TEACHER',
      password: this.newTeacher.password
    } as Teacher;

    this.teacherService
      .addTeacher(teacherToAdd)
      .subscribe({

        next: (response) => {

          console.log('Teacher added:', response);

          alert('Teacher added successfully');

          form.resetForm();
          this.clearTeacherForm();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Error adding teacher:', error);

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert('You are not authorized to add teachers.');
          } else if (error.status === 400) {
            alert(
              error.error?.message ||
              'Invalid teacher data.'
            );
          } else {
            alert('Failed to add teacher.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  clearTeacherForm() {

    this.newTeacher = {
      username: '',
      name: '',
      email: '',
      password: ''
    };
  }

  cancelAddTeacher(form: NgForm) {
    form.resetForm();
    this.clearTeacherForm();
  }

  // Loads the teacher list for the admin.
  loadTeacherList() {

    this.loadingTeacherList = true;

    this.teacherService
      .getAllTeachers()
      .pipe(
        finalize(() => {
          this.loadingTeacherList = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (teachers) => {

          this.teacherList = teachers;

          // Reset pagination after loading fresh teacher data.
          this.teacherCurrentPage = 1;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading teacher list:',
            error
          );

          this.teacherList = [];
          this.teacherCurrentPage = 1;

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to view teachers.'
            );
          } else {
            alert('Failed to load teachers.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // =========================================================
  // TEACHER SEARCH / SORT / PAGINATION
  // =========================================================

 onTeacherSearch(value: string): void {
  this.teacherSearchTerm = value.trim().toLowerCase();
  this.teacherCurrentPage = 1;
}

toggleTeacherIdSort(): void {
  this.teacherSortDirection =
    this.teacherSortDirection === 'asc'
      ? 'desc'
      : 'asc';

  this.teacherCurrentPage = 1;
}

setTeacherPageSize(value: string): void {
  const pageSize = Number(value);

  if (
    pageSize === 5 ||
    pageSize === 10 ||
    pageSize === 15 ||
    pageSize === 20 ||
    pageSize === 25 ||
    pageSize === 50 ||
    pageSize === 100
  ) {
    this.teacherPageSize = pageSize;
    this.teacherCurrentPage = 1;
  }
}

getFilteredSortedTeachers(): Teacher[] {
  const term = this.teacherSearchTerm
    .trim()
    .toLowerCase();

  let result: Teacher[];

  if (term) {
    result = this.teacherList.filter(teacher =>
      (teacher.name || '')
        .toLowerCase()
        .startsWith(term)
    );
  } else {
    result = [...this.teacherList];
  }

  result.sort((a, b) => {
    const idA = a.id ?? 0;
    const idB = b.id ?? 0;

    return this.teacherSortDirection === 'asc'
      ? idA - idB
      : idB - idA;
  });

  return result;
}

getVisibleTeachers(): Teacher[] {
  const result = this.getFilteredSortedTeachers();

  const start =
    (this.teacherCurrentPage - 1) *
    this.teacherPageSize;

  const end =
    start + this.teacherPageSize;

  return result.slice(start, end);
}

getTeacherTotalPages(): number {
  return Math.ceil(
    this.getFilteredSortedTeachers().length /
    this.teacherPageSize
  );
}

goToTeacherPage(page: number): void {
  const totalPages = this.getTeacherTotalPages();

  if (
    page >= 1 &&
    page <= totalPages
  ) {
    this.teacherCurrentPage = page;
  }
}

previousTeacherPage(): void {
  if (this.teacherCurrentPage > 1) {
    this.teacherCurrentPage--;
  }
}

nextTeacherPage(): void {
  const totalPages = this.getTeacherTotalPages();

  if (
    this.teacherCurrentPage < totalPages
  ) {
    this.teacherCurrentPage++;
  }
}

getTeacherPageNumbers(): number[] {
  const totalPages = this.getTeacherTotalPages();

  return Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );
}

// =========================================================
// TEACHER UPDATE POPUP
// =========================================================

openTeacherUpdateModal(teacher: Teacher) {

  if (
    teacher.id === null ||
    teacher.id === undefined
  ) {
    alert('Invalid teacher ID.');
    return;
  }

  // Make sure delete modal/state is completely closed
  this.closeTeacherDeleteModal();

  this.selectedTeacherForUpdate = teacher;

  this.modalTeacher = {
    username: teacher.username || '',
    name: teacher.name || '',
    email: teacher.email || ''
  };

  this.showTeacherUpdateModal = true;

  this.cdr.detectChanges();
}

closeTeacherUpdateModal() {

  this.showTeacherUpdateModal = false;

  this.selectedTeacherForUpdate = null;

  this.modalTeacher = {
    username: '',
    name: '',
    email: ''
  };

  this.cdr.detectChanges();
}

saveTeacherFromModal(form: NgForm) {

  const teacherId =
    this.selectedTeacherForUpdate?.id;

  if (
    teacherId === null ||
    teacherId === undefined
  ) {
    alert('Teacher information is not available.');
    return;
  }

  if (form.invalid) {

    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
    });

    return;
  }

  const teacherData: Teacher = {
    id: teacherId,
    username: this.modalTeacher.username,
    name: this.modalTeacher.name,
    email: this.modalTeacher.email,
    role: 'TEACHER'
  };

  this.teacherService
    .updateTeacher(teacherId, teacherData)
    .subscribe({

      next: (response) => {

        console.log(
          'Teacher updated from modal:',
          response
        );

        alert('Teacher updated successfully');

        // IMPORTANT:
        // Completely close and clear the update modal
        this.closeTeacherUpdateModal();

        // Refresh teacher table
        this.loadTeacherList();

      },

      error: (error) => {

        console.error(
          'Teacher modal update error:',
          error
        );

        if (error.status === 401) {

          alert('Session expired. Please login again.');

        } else if (error.status === 403) {

          alert(
            'You are not authorized to update this teacher.'
          );

        } else if (error.status === 404) {

          alert('Teacher not found.');

        } else if (error.status === 400) {

          alert(
            error.error?.message ||
            'Invalid teacher data.'
          );

        } else {

          alert('Failed to update teacher.');

        }

        this.cdr.detectChanges();
      }

    });
}


// =========================================================
// TEACHER DELETE POPUP
// =========================================================

openTeacherDeleteModal(teacher: Teacher) {

  if (
    teacher.id === null ||
    teacher.id === undefined
  ) {
    alert('Invalid teacher ID.');
    return;
  }

  // Make sure update modal/state is completely closed
  this.closeTeacherUpdateModal();

  this.selectedTeacherForDelete = teacher;

  this.showTeacherDeleteModal = true;

  this.cdr.detectChanges();
}

closeTeacherDeleteModal() {

  this.showTeacherDeleteModal = false;

  this.selectedTeacherForDelete = null;

  this.cdr.detectChanges();
}

confirmTeacherDeleteFromModal() {

  const teacherId =
    this.selectedTeacherForDelete?.id;

  if (
    teacherId === null ||
    teacherId === undefined
  ) {
    alert('Teacher information is not available.');
    return;
  }

  this.teacherService
    .deleteTeacher(teacherId)
    .subscribe({

      next: () => {

        alert('Teacher deleted successfully');

        // IMPORTANT:
        // Completely close and clear the delete modal
        this.closeTeacherDeleteModal();

        // Refresh teacher table
        this.loadTeacherList();

      },

      error: (error) => {

        console.error(
          'Teacher modal delete error:',
          error
        );

        if (error.status === 401) {

          alert('Session expired. Please login again.');

        } else if (error.status === 403) {

          alert(
            'You are not authorized to delete this teacher.'
          );

        } else if (error.status === 404) {

          alert('Teacher not found.');

        } else if (error.status === 400) {

          alert(
            error.error?.message ||
            'Teacher cannot be deleted.'
          );

        } else {

          alert(
            error.error?.message ||
            'Failed to delete teacher.'
          );

        }

        this.cdr.detectChanges();
      }

    });
}



  // =========================================================
  // EXISTING TEACHER UPDATE FUNCTIONALITY
  // KEPT UNCHANGED
  // =========================================================

  // Finds a teacher and loads the data into the update form.
  findTeacherForUpdate() {

    if (
      this.updateTeacherId === null ||
      this.updateTeacherId <= 0
    ) {
      alert('Please enter a valid teacher ID.');
      return;
    }

    const teacherId = this.updateTeacherId;

    this.searchingTeacher = true;
    this.teacherFound = false;
    this.searchedTeacherId = null;

    this.clearUpdateTeacher();
    this.cdr.detectChanges();

    this.teacherService
      .getTeacherById(teacherId)
      .pipe(
        finalize(() => {
          this.searchingTeacher = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (teacher) => {

          if (!teacher) {
            alert(
              `Teacher with ID ${teacherId} does not exist.`
            );

            return;
          }

          this.searchedTeacherId = teacher.id ?? null;

          this.updateTeacher = {
            username: teacher.username,
            name: teacher.name,
            email: teacher.email
          };

          this.teacherFound = true;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Teacher update search error:',
            error
          );

          this.teacherFound = false;
          this.searchedTeacherId = null;

          this.clearUpdateTeacher();

          if (error.status === 404) {
            alert(
              `Teacher with ID ${teacherId} does not exist.`
            );
          } else if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to access this teacher.'
            );
          } else {
            alert('Failed to fetch teacher.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Sends the updated teacher data to the backend.
  updateExistingTeacher(form: NgForm) {

    if (
      this.searchedTeacherId === null ||
      !this.teacherFound
    ) {
      alert('Please search for a teacher first.');
      return;
    }

    if (form.invalid) {

      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });

      return;
    }

    const confirmUpdate = confirm(
      'Do you want to update this particular teacher?'
    );

    if (!confirmUpdate) {
      return;
    }

    const teacherId = this.searchedTeacherId;

    const teacherData: Teacher = {
      id: teacherId,
      username: this.updateTeacher.username,
      name: this.updateTeacher.name,
      email: this.updateTeacher.email,
      role: 'TEACHER'
    };

    this.teacherService
      .updateTeacher(teacherId, teacherData)
      .subscribe({

        next: (response) => {

          console.log('Teacher updated:', response);

          alert('Teacher updated successfully');

          this.resetTeacherUpdate();
          this.loadTeacherList();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Teacher update error:',
            error
          );

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to update this teacher.'
            );
          } else if (error.status === 404) {
            alert('Teacher not found.');
          } else if (error.status === 400) {
            alert('Invalid teacher data.');
          } else {
            alert('Failed to update teacher.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  clearUpdateTeacher() {

    this.updateTeacher = {
      username: '',
      name: '',
      email: ''
    };
  }

  resetTeacherUpdate() {

    this.updateTeacherId = null;
    this.searchedTeacherId = null;
    this.teacherFound = false;
    this.searchingTeacher = false;

    this.clearUpdateTeacher();
  }

  // =========================================================
  // EXISTING TEACHER DELETE FUNCTIONALITY
  // KEPT UNCHANGED
  // =========================================================

  // Finds a teacher before allowing deletion.
  findTeacherForDelete() {

    if (
      this.deleteTeacherId === null ||
      this.deleteTeacherId <= 0
    ) {
      alert('Please enter a valid teacher ID.');
      return;
    }

    const teacherId = this.deleteTeacherId;

    this.searchingDeleteTeacher = true;
    this.deleteTeacherFound = false;
    this.searchedDeleteTeacherId = null;

    this.clearDeleteTeacher();
    this.cdr.detectChanges();

    this.teacherService
      .getTeacherById(teacherId)
      .pipe(
        finalize(() => {
          this.searchingDeleteTeacher = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (teacher) => {

          if (!teacher) {
            alert(
              `Teacher with ID ${teacherId} does not exist.`
            );

            return;
          }

          this.searchedDeleteTeacherId =
            teacher.id ?? null;

          this.deleteTeacher = {
            username: teacher.username,
            name: teacher.name,
            email: teacher.email
          };

          this.deleteTeacherFound = true;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Teacher delete search error:',
            error
          );

          this.deleteTeacherFound = false;
          this.searchedDeleteTeacherId = null;

          this.clearDeleteTeacher();

          if (error.status === 404) {
            alert(
              `Teacher with ID ${teacherId} does not exist.`
            );
          } else if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to access this teacher.'
            );
          } else {
            alert('Failed to fetch teacher.');
          }

          this.cdr.detectChanges();
        }

      });
  }

  // Deletes the selected teacher after confirmation.
  deleteExistingTeacher() {

    if (
      this.searchedDeleteTeacherId === null ||
      !this.deleteTeacherFound
    ) {
      alert('Please search for a teacher first.');
      return;
    }

    const confirmDelete = confirm(
      'Do you want to delete this particular teacher?'
    );

    if (!confirmDelete) {
      return;
    }

    const teacherId = this.searchedDeleteTeacherId;

    this.teacherService
      .deleteTeacher(teacherId)
      .subscribe({

        next: () => {

          alert('Teacher deleted successfully');

          this.resetTeacherDelete();
          this.loadTeacherList();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Teacher delete error:',
            error
          );

          if (error.status === 401) {
            alert('Session expired. Please login again.');
          } else if (error.status === 403) {
            alert(
              'You are not authorized to delete this teacher.'
            );
          } else if (error.status === 404) {
            alert('Teacher not found.');
          } else if (error.status === 400) {
            alert(
              error.error?.message ||
              'Teacher cannot be deleted.'
            );
          } else {
            alert(
              error.error?.message ||
              'Failed to delete teacher.'
            );
          }

          this.cdr.detectChanges();
        }

      });
  }

  clearDeleteTeacher() {

    this.deleteTeacher = {
      username: '',
      name: '',
      email: ''
    };
  }

  resetTeacherDelete() {

    this.deleteTeacherId = null;
    this.searchedDeleteTeacherId = null;
    this.deleteTeacherFound = false;
    this.searchingDeleteTeacher = false;

    this.clearDeleteTeacher();
  }

}
