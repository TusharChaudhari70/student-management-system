import { ChangeDetectorRef, Component } from '@angular/core';import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { Auth } from '../../services/auth';
import {
  StudentService,
  Teacher
} from '../../services/student.service';import { StudentList } from '../student-list/student-list';

@Component({
  selector: 'app-admin',
  imports: [
    FormsModule,
    StudentList
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  username = localStorage.getItem('username');
  role = localStorage.getItem('role');

  selectedSection = 'dashboard';
  selectedStudentAction = '';


  /* =========================
     ADD STUDENT
  ========================= */

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

  /* =========================
     UPDATE STUDENT
  ========================= */

  // ID currently typed by user
  updateStudentId: number | null = null;

  // ID of student actually loaded from database
  searchedStudentId: number | null = null;

  updateStudent = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  searchingStudent = false;
  studentFound = false;


  /* =========================
     DELETE STUDENT
  ========================= */

  // ID currently typed by user
  deleteStudentId: number | null = null;

  // ID of student actually loaded from database
  searchedDeleteStudentId: number | null = null;

  deleteStudent = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  searchingDeleteStudent = false;
  deleteStudentFound = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

constructor(
  private authService: Auth,
  private studentService: StudentService,
  private cdr: ChangeDetectorRef
) {}


  /* =========================
     LOGOUT
  ========================= */

  logout() {
    this.authService.logout();
  }


  /* =========================
     SECTION NAVIGATION
  ========================= */

  selectSection(section: string) {

    this.selectedSection = section;
    this.selectedStudentAction = '';

    // Clear all temporary student forms
    this.resetUpdate();
    this.resetDelete();
  }


  /* =========================
     STUDENT ACTION NAVIGATION
  ========================= */

  selectStudentAction(action: string) {

  this.selectedSection = 'students';
  this.selectedStudentAction = action;

  // Always clear old Update data
  this.resetUpdate();

  // Always clear old Delete data
  this.resetDelete();


  // Load teachers only for Add Student
  if (action === 'add') {

    this.loadTeachers();

  }
}
loadTeachers() {

  this.loadingTeachers = true;

  this.studentService
    .getAllTeachers()
    .pipe(
      finalize(() => {

        this.loadingTeachers = false;

        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (teachers) => {

        console.log(
          'Teachers received from DB:',
          teachers
        );

        this.teachers = teachers;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error loading teachers:',
          error
        );

        this.teachers = [];

        if (error.status === 401) {

          alert(
            'Session expired. Please login again.'
          );

        } else if (error.status === 403) {

          alert(
            'You are not authorized to load teachers.'
          );

        } else {

          alert(
            'Failed to load teachers.'
          );
        }

        this.cdr.detectChanges();
      }
    });
}


  /* =========================
     ADD STUDENT
  ========================= */

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


  // Create student object with selected teacher
  const studentToAdd = {

    ...this.newStudent,

    teacher: {
      id: this.selectedTeacherId
    }

  };


  console.log(
    'Student being added:',
    studentToAdd
  );


  this.studentService
    .addStudent(studentToAdd)
    .subscribe({

      next: (response) => {

        console.log(
          'Student added:',
          response
        );

        alert(
          'Student added successfully'
        );


        // Clear form
        form.resetForm({

          name: '',

          email: '',

          course: '',

          age: 0,

          teacher: null

        });


        // Clear student object
        this.clearStudentForm();


        // Clear selected teacher
        this.selectedTeacherId = null;


        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Error adding student:',
          error
        );


        if (error.status === 401) {

          alert(
            'Session expired. Please login again.'
          );

        } else if (error.status === 403) {

          alert(
            'You are not authorized to add students.'
          );

        } else if (error.status === 400) {

          alert(
            error.error?.message ||
            'Invalid student data.'
          );

        } else {

          alert(
            'Failed to add student.'
          );
        }
      }
    });
}


  /* =========================
     CANCEL ADD STUDENT
  ========================= */

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


  /* =========================
     CLEAR ADD STUDENT FORM
  ========================= */

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


  /* =========================
     FIND STUDENT FOR UPDATE
  ========================= */

 findStudentForUpdate() {

  if (
    this.updateStudentId === null ||
    this.updateStudentId <= 0
  ) {
    alert('Please enter a valid student ID.');
    return;
  }

  const studentId = this.updateStudentId;

  console.log('Searching student ID:', studentId);

  this.searchingStudent = true;
  this.studentFound = false;
  this.searchedStudentId = null;

  this.clearUpdateStudent();

  // Immediately update UI
  this.cdr.detectChanges();

  this.studentService
    .getStudentById(studentId)
    .pipe(
      finalize(() => {

        this.searchingStudent = false;

        // Force UI refresh
        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (student) => {

        console.log(
          'Student received from DB:',
          student
        );

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

        // Store actual database ID
        this.searchedStudentId =
          student.id ?? null;

        // Populate update form
        this.updateStudent = {

          name: student.name,

          email: student.email,

          course: student.course,

          age: student.age
        };

        // Tell Angular to display the form
        this.studentFound = true;

        console.log(
          'Update form populated:',
          this.updateStudent
        );

        console.log(
          'Searched student ID:',
          this.searchedStudentId
        );

        // IMPORTANT:
        // Refresh UI immediately
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'UPDATE SEARCH ERROR:',
          error
        );

        this.studentFound = false;
        this.searchedStudentId = null;

        this.clearUpdateStudent();

        if (error.status === 404) {

          alert(
            `Student with ID ${studentId} does not exist.`
          );

        } else if (error.status === 401) {

          alert(
            'Session expired. Please login again.'
          );

        } else if (error.status === 403) {

          alert(
            'You are not authorized to access this student.'
          );

        } else {

          alert(
            'Failed to fetch student.'
          );
        }

        // Refresh UI after error
        this.cdr.detectChanges();
      }
    });
}


  /* =========================
     UPDATE EXISTING STUDENT
  ========================= */

 updateExistingStudent(form: NgForm) {

  if (
    this.searchedStudentId === null ||
    !this.studentFound
  ) {
    alert('Please search for a student first.');
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

  console.log('PUT student ID:', studentId);
  console.log('PUT student data:', this.updateStudent);

  this.studentService
    .updateStudent(
      studentId,
      this.updateStudent
    )
    .subscribe({

      next: (response) => {

        console.log(
          'UPDATE SUCCESS:',
          response
        );

        alert(
          'Student updated successfully'
        );

        // Clear everything
        this.resetUpdate();

        // IMPORTANT:
        // Force Angular to immediately remove
        // the update form from the screen
        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'UPDATE ERROR:',
          error
        );

        console.error(
          'UPDATE STATUS:',
          error.status
        );

        console.error(
          'UPDATE ERROR BODY:',
          error.error
        );

        if (error.status === 401) {

          alert(
            'Session expired. Please login again.'
          );

        } else if (error.status === 403) {

          alert(
            'You are not authorized to update this student.'
          );

        } else if (error.status === 404) {

          alert(
            'Student not found.'
          );

        } else if (error.status === 400) {

          alert(
            'Invalid student data.'
          );

        } else {

          alert(
            'Failed to update student.'
          );
        }

        this.cdr.detectChanges();
      }
    });
}


  /* =========================
     CLEAR UPDATE FORM
  ========================= */

  clearUpdateStudent() {

    this.updateStudent = {

      name: '',

      email: '',

      course: '',

      age: 0
    };
  }


  /* =========================
     RESET UPDATE
  ========================= */

  resetUpdate() {

    // Clear typed ID
    this.updateStudentId = null;

    // Clear searched ID
    this.searchedStudentId = null;

    // Hide form
    this.studentFound = false;

    // Stop loading
    this.searchingStudent = false;

    // Clear fields
    this.clearUpdateStudent();

    console.log(
      'Update form reset'
    );
  }


  /* =========================
     FIND STUDENT FOR DELETE
  ========================= */

 findStudentForDelete() {

  if (
    this.deleteStudentId === null ||
    this.deleteStudentId <= 0
  ) {
    alert('Please enter a valid student ID.');
    return;
  }

  const studentId = this.deleteStudentId;

  console.log(
    'Searching student for delete:',
    studentId
  );

  this.searchingDeleteStudent = true;
  this.deleteStudentFound = false;
  this.searchedDeleteStudentId = null;

  this.clearDeleteStudent();

  // Immediately update UI
  this.cdr.detectChanges();

  this.studentService
    .getStudentById(studentId)
    .pipe(
      finalize(() => {

        this.searchingDeleteStudent = false;

        // Force UI refresh
        this.cdr.detectChanges();

      })
    )
    .subscribe({

      next: (student) => {

        console.log(
          'Student received for delete:',
          student
        );

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

        console.log(
          'Student found for delete:',
          this.searchedDeleteStudentId
        );

        // Immediately show details
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'DELETE SEARCH ERROR:',
          error
        );

        this.deleteStudentFound = false;
        this.searchedDeleteStudentId = null;

        this.clearDeleteStudent();

        if (error.status === 404) {

          alert(
            `Student with ID ${studentId} does not exist.`
          );

        } else if (error.status === 401) {

          alert(
            'Session expired. Please login again.'
          );

        } else if (error.status === 403) {

          alert(
            'You are not authorized to access this student.'
          );

        } else {

          alert(
            'Failed to fetch student.'
          );
        }

        this.cdr.detectChanges();
      }
    });
}


  /* =========================
     DELETE EXISTING STUDENT
  ========================= */

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

  console.log(
    'DELETE student ID:',
    studentId
  );

  this.studentService
    .deleteStudent(studentId)
    .subscribe({

      next: () => {

        console.log(
          'DELETE SUCCESS:',
          studentId
        );

        alert(
          'Student deleted successfully'
        );

        // Clear all delete data
        this.resetDelete();

        // Force Angular UI refresh
        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'DELETE ERROR:',
          error
        );

        if (error.status === 401) {

          alert(
            'Session expired. Please login again.'
          );

        } else if (error.status === 403) {

          alert(
            'You are not authorized to delete this student.'
          );

        } else if (error.status === 404) {

          alert(
            'Student not found.'
          );

        } else {

          alert(
            'Failed to delete student.'
          );
        }

        this.cdr.detectChanges();
      }
    });
}


  /* =========================
     CLEAR DELETE FORM
  ========================= */

  clearDeleteStudent() {

    this.deleteStudent = {

      name: '',

      email: '',

      course: '',

      age: 0
    };
  }


  /* =========================
     RESET DELETE
  ========================= */

  resetDelete() {

    // Clear typed ID
    this.deleteStudentId = null;

    // Clear searched ID
    this.searchedDeleteStudentId = null;

    // Hide details
    this.deleteStudentFound = false;

    // Stop loading
    this.searchingDeleteStudent = false;

    // Clear student details
    this.clearDeleteStudent();

    console.log(
      'Delete form reset'
    );
  }
}