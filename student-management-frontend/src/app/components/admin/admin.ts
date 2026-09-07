import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { Auth } from '../../services/auth';
import {
  StudentService,
  Teacher
} from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { StudentList } from '../student-list/student-list';

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
  selectedTeacherAction = '';

  // =====================================================
  // STUDENT ADD
  // =====================================================

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


  // =====================================================
  // STUDENT UPDATE
  // =====================================================

  updateStudentId: number | null = null;
  searchedStudentId: number | null = null;

  updateStudent = {
    name: '',
    email: '',
    course: '',
    age: 0,
    teacher: null as { id: number } | null
  };

  // Separate selected teacher ID for update
  selectedUpdateTeacherId: number | null = null;

  searchingStudent = false;
  studentFound = false;


  // =====================================================
  // STUDENT DELETE
  // =====================================================

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


  // =====================================================
  // TEACHER ADD
  // =====================================================

  newTeacher = {
    username: '',
    name: '',
    email: '',
    password: ''
  };

  teacherList: Teacher[] = [];
  loadingTeacherList = false;


  // =====================================================
  // TEACHER UPDATE
  // =====================================================

  updateTeacherId: number | null = null;
  searchedTeacherId: number | null = null;

  updateTeacher = {
    username: '',
    name: '',
    email: ''
  };

  searchingTeacher = false;
  teacherFound = false;


  // =====================================================
  // TEACHER DELETE
  // =====================================================

  deleteTeacherId: number | null = null;
  searchedDeleteTeacherId: number | null = null;

  deleteTeacher = {
    username: '',
    name: '',
    email: ''
  };

  searchingDeleteTeacher = false;
  deleteTeacherFound = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private authService: Auth,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // LOGOUT
  // =====================================================

  logout() {
    this.authService.logout();
  }


  // =====================================================
  // SECTION TOGGLE
  // =====================================================

  selectSection(section: string) {

    // ================================
    // STUDENTS TOGGLE
    // ================================

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


    // ================================
    // TEACHERS TOGGLE
    // ================================

    if (section === 'teachers') {

      if (this.selectedSection === 'teachers') {

        this.selectedSection = '';
        this.selectedTeacherAction = '';

        this.resetTeacherUpdate();
        this.resetTeacherDelete();

        return;
      }

      this.selectedSection = 'teachers';
      this.selectedTeacherAction = '';
      this.selectedStudentAction = '';

      this.resetUpdate();
      this.resetDelete();
      this.resetTeacherUpdate();
      this.resetTeacherDelete();

      this.loadTeacherList();

      return;
    }


    // ================================
    // OTHER SECTIONS
    // ================================

    this.selectedSection = section;
    this.selectedStudentAction = '';
    this.selectedTeacherAction = '';

    this.resetUpdate();
    this.resetDelete();
    this.resetTeacherUpdate();
    this.resetTeacherDelete();
  }


  // =====================================================
  // STUDENT ACTION
  // =====================================================

  selectStudentAction(action: string) {

    // Double-click / click same operation again = close
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


  // =====================================================
  // TEACHER ACTION
  // =====================================================

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


  // =====================================================
  // LOAD TEACHERS
  // =====================================================

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


  // =====================================================
  // ADD STUDENT
  // =====================================================

  addStudent(form: NgForm) {

    if (
      form.invalid ||
      this.selectedTeacherId === null
    ) {

      Object.values(form.controls).forEach(
        control => {
          control.markAsTouched();
        }
      );

      return;
    }

    const studentToAdd = {
      ...this.newStudent,
      teacher: {
        id: this.selectedTeacherId
      }
    };

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

          form.resetForm({
            name: '',
            email: '',
            course: '',
            age: 0,
            teacher: null
          });

          this.clearStudentForm();

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


  // =====================================================
  // CANCEL ADD STUDENT
  // =====================================================

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


  // =====================================================
  // CLEAR STUDENT FORM
  // =====================================================

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


  // =====================================================
  // FIND STUDENT FOR UPDATE
  // =====================================================

  findStudentForUpdate() {

    if (
      this.updateStudentId === null ||
      this.updateStudentId <= 0
    ) {

      alert(
        'Please enter a valid student ID.'
      );

      return;
    }

    const studentId =
      this.updateStudentId;

    this.searchingStudent = true;
    this.studentFound = false;
    this.searchedStudentId = null;

    this.clearUpdateStudent();

    // Clear old teacher selection
    this.selectedUpdateTeacherId = null;

    // Load teacher list
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

          this.searchedStudentId =
            student.id ?? null;


          // Fill student information
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


          // IMPORTANT:
          // Keep the currently assigned teacher selected
          this.selectedUpdateTeacherId =
            student.teacher?.id ?? null;


          this.studentFound = true;

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

          this.selectedUpdateTeacherId = null;


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


  // =====================================================
  // UPDATE EXISTING STUDENT
  // =====================================================

  updateExistingStudent(form: NgForm) {

    if (
      this.searchedStudentId === null ||
      !this.studentFound
    ) {

      alert(
        'Please search for a student first.'
      );

      return;
    }


    if (
      this.selectedUpdateTeacherId === null
    ) {

      alert(
        'Please select a teacher.'
      );

      return;
    }


    if (form.invalid) {

      Object.values(form.controls).forEach(
        control => {
          control.markAsTouched();
        }
      );

      return;
    }


    const confirmUpdate = confirm(
      'Do you want to update this particular student?'
    );

    if (!confirmUpdate) {
      return;
    }


    const studentId =
      this.searchedStudentId;


    // Send teacher ID to backend
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
      .updateStudent(
        studentId,
        studentData
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

          this.resetUpdate();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'UPDATE ERROR:',
            error
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
              error.error?.message ||
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


  // =====================================================
  // CLEAR UPDATE STUDENT
  // =====================================================

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


  // =====================================================
  // RESET UPDATE STUDENT
  // =====================================================

  resetUpdate() {

    this.updateStudentId = null;

    this.searchedStudentId = null;

    this.studentFound = false;

    this.searchingStudent = false;

    this.clearUpdateStudent();

    this.selectedUpdateTeacherId = null;
  }


  // =====================================================
  // FIND STUDENT FOR DELETE
  // =====================================================

  findStudentForDelete() {

    if (
      this.deleteStudentId === null ||
      this.deleteStudentId <= 0
    ) {

      alert(
        'Please enter a valid student ID.'
      );

      return;
    }

    const studentId =
      this.deleteStudentId;

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


  // =====================================================
  // DELETE EXISTING STUDENT
  // =====================================================

  deleteExistingStudent() {

    if (
      this.searchedDeleteStudentId === null ||
      !this.deleteStudentFound
    ) {

      alert(
        'Please search for a student first.'
      );

      return;
    }

    const confirmDelete = confirm(
      'Do you want to delete this particular student?'
    );

    if (!confirmDelete) {
      return;
    }

    const studentId =
      this.searchedDeleteStudentId;

    this.studentService
      .deleteStudent(studentId)
      .subscribe({

        next: () => {

          alert(
            'Student deleted successfully'
          );

          this.resetDelete();

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


  // =====================================================
  // CLEAR DELETE STUDENT
  // =====================================================

  clearDeleteStudent() {

    this.deleteStudent = {

      name: '',

      email: '',

      course: '',

      age: 0
    };
  }


  // =====================================================
  // RESET DELETE STUDENT
  // =====================================================

  resetDelete() {

    this.deleteStudentId = null;

    this.searchedDeleteStudentId = null;

    this.deleteStudentFound = false;

    this.searchingDeleteStudent = false;

    this.clearDeleteStudent();
  }


  // =====================================================
  // TEACHER CRUD
  // =====================================================

  addTeacher(form: NgForm) {

    if (form.invalid) {

      Object.values(form.controls).forEach(
        control => {
          control.markAsTouched();
        }
      );

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

          console.log(
            'Teacher added:',
            response
          );

          alert(
            'Teacher added successfully'
          );

          form.resetForm();

          this.clearTeacherForm();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error adding teacher:',
            error
          );

          if (error.status === 401) {

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to add teachers.'
            );

          } else if (error.status === 400) {

            alert(
              error.error?.message ||
              'Invalid teacher data.'
            );

          } else {

            alert(
              'Failed to add teacher.'
            );
          }

          this.cdr.detectChanges();
        }
      });
  }


  // =====================================================
  // CLEAR TEACHER FORM
  // =====================================================

  clearTeacherForm() {

    this.newTeacher = {

      username: '',

      name: '',

      email: '',

      password: ''
    };
  }


  // =====================================================
  // LOAD TEACHER LIST
  // =====================================================

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

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading teacher list:',
            error
          );

          this.teacherList = [];


          if (error.status === 401) {

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to view teachers.'
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


  // =====================================================
  // FIND TEACHER FOR UPDATE
  // =====================================================

  findTeacherForUpdate() {

    if (
      this.updateTeacherId === null ||
      this.updateTeacherId <= 0
    ) {

      alert(
        'Please enter a valid teacher ID.'
      );

      return;
    }

    const teacherId =
      this.updateTeacherId;

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

          this.searchedTeacherId =
            teacher.id ?? null;

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

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to access this teacher.'
            );

          } else {

            alert(
              'Failed to fetch teacher.'
            );
          }

          this.cdr.detectChanges();
        }
      });
  }


  // =====================================================
  // UPDATE EXISTING TEACHER
  // =====================================================

  updateExistingTeacher(form: NgForm) {

    if (
      this.searchedTeacherId === null ||
      !this.teacherFound
    ) {

      alert(
        'Please search for a teacher first.'
      );

      return;
    }

    if (form.invalid) {

      Object.values(form.controls).forEach(
        control => {
          control.markAsTouched();
        }
      );

      return;
    }

    const confirmUpdate = confirm(
      'Do you want to update this particular teacher?'
    );

    if (!confirmUpdate) {
      return;
    }

    const teacherId =
      this.searchedTeacherId;

    const teacherData: Teacher = {

      id: teacherId,

      username: this.updateTeacher.username,

      name: this.updateTeacher.name,

      email: this.updateTeacher.email,

      role: 'TEACHER'

    };


    this.teacherService
      .updateTeacher(
        teacherId,
        teacherData
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Teacher updated:',
            response
          );

          alert(
            'Teacher updated successfully'
          );

          this.resetTeacherUpdate();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Teacher update error:',
            error
          );

          if (error.status === 401) {

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to update this teacher.'
            );

          } else if (error.status === 404) {

            alert(
              'Teacher not found.'
            );

          } else if (error.status === 400) {

            alert(
              'Invalid teacher data.'
            );

          } else {

            alert(
              'Failed to update teacher.'
            );
          }

          this.cdr.detectChanges();
        }
      });
  }


  // =====================================================
  // CLEAR UPDATE TEACHER
  // =====================================================

  clearUpdateTeacher() {

    this.updateTeacher = {

      username: '',

      name: '',

      email: ''
    };
  }


  // =====================================================
  // RESET UPDATE TEACHER
  // =====================================================

  resetTeacherUpdate() {

    this.updateTeacherId = null;

    this.searchedTeacherId = null;

    this.teacherFound = false;

    this.searchingTeacher = false;

    this.clearUpdateTeacher();
  }


  // =====================================================
  // FIND TEACHER FOR DELETE
  // =====================================================

  findTeacherForDelete() {

    if (
      this.deleteTeacherId === null ||
      this.deleteTeacherId <= 0
    ) {

      alert(
        'Please enter a valid teacher ID.'
      );

      return;
    }

    const teacherId =
      this.deleteTeacherId;

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

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to access this teacher.'
            );

          } else {

            alert(
              'Failed to fetch teacher.'
            );
          }

          this.cdr.detectChanges();
        }
      });
  }


  // =====================================================
  // DELETE EXISTING TEACHER
  // =====================================================

  deleteExistingTeacher() {

    if (
      this.searchedDeleteTeacherId === null ||
      !this.deleteTeacherFound
    ) {

      alert(
        'Please search for a teacher first.'
      );

      return;
    }

    const confirmDelete = confirm(
      'Do you want to delete this particular teacher?'
    );

    if (!confirmDelete) {
      return;
    }

    const teacherId =
      this.searchedDeleteTeacherId;


    this.teacherService
      .deleteTeacher(teacherId)
      .subscribe({

        next: () => {

          alert(
            'Teacher deleted successfully'
          );

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

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to delete this teacher.'
            );

          } else if (error.status === 404) {

            alert(
              'Teacher not found.'
            );

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


  // =====================================================
  // CLEAR DELETE TEACHER
  // =====================================================

  clearDeleteTeacher() {

    this.deleteTeacher = {

      username: '',

      name: '',

      email: ''
    };
  }


  // =====================================================
  // RESET DELETE TEACHER
  // =====================================================

  resetTeacherDelete() {

    this.deleteTeacherId = null;

    this.searchedDeleteTeacherId = null;

    this.deleteTeacherFound = false;

    this.searchingDeleteTeacher = false;

    this.clearDeleteTeacher();
  }
}