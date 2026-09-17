import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';

import { Auth } from '../../../core/services/auth';
import {
  Student,
  StudentService
} from '../../../services/student.service';
import { Teacher as TeacherModel, TeacherService } from '../../../services/teacher.service';
import { MessageService } from '../../../core/services/message.service';
import { TaskService } from '../../../services/task.service';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../shared/models/subject.model';
import { StudentList } from '../../../shared/components/student-list/student-list';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { StudentForm } from '../../../shared/components/student-form/student-form';
import { Message } from '../../../shared/models/message.model';
import { TaskResponse } from '../../../shared/models/task.model';

@Component({
  selector: 'app-teacher',
  imports: [
    FormsModule,
    CommonModule,
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
    username: '',
    password: '',
    course: '',
    age: null as number | null
  };

  // Subject dropdown for the student forms
  subjects: Subject[] = [];
  selectedSubjectIds: number[] = [];
  loadingSubjects = false;

  // Student Update
  selectedStudentForUpdate: Student | null = null;
  showStudentUpdateModal = false;
  updateStudent = {
    name: '',
    email: '',
    username: '',
    password: '',
    course: '',
    age: 0
  };
  updateSubjectIds: number[] = [];

  // Student Delete
  selectedStudentForDelete: Student | null = null;
  showStudentDeleteModal = false;
  deleteStudent = {
    name: '',
    email: '',
    course: '',
    age: 0
  };

  // Students list
  students: Student[] = [];
  studentListRefreshKey = 0;

  // Announcements, attachments & tasks
  sentMessages: Message[] = [];
  selectedAnnouncementStudentIds: number[] = [];
  openStudentSelector: 'announcement' | 'task' | null = null;
  newMessageText = '';
  sendingMessage = false;

  selectedTaskStudentIds: number[] = [];
  taskAttachment: File | null = null;
  taskAttachmentName = '';

  newTask = {
    title: '',
    description: '',
    dueDate: ''
  };
  assigningTask = false;
  assignedTasks: TaskResponse[] = [];
  activeHistory: 'announcements' | 'tasks' | null = null;
  selectedTaskReply: TaskResponse | null = null;
  private taskFileInput: HTMLInputElement | null = null;

  constructor(
    private authService: Auth,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private messageService: MessageService,
    private taskService: TaskService,
    private subjectService: SubjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadAssignedStudents();
    this.loadSentMessages();
    this.loadAssignedTasks();
    this.loadSubjects();
  }

  logout(): void {
    this.authService.logout();
  }

  selectSection(section: string): void {
    this.selectedSection = section;
    this.selectedStudentAction = section === 'students' ? 'add' : '';

    if (section === 'profile') {
      this.loadProfile();
    } else if (section === 'communication') {
      this.loadAssignedStudents();
      this.loadSentMessages();
      this.loadAssignedTasks();
    }
  }

  selectStudentAction(action: string): void {
    this.selectedSection = 'students';
    this.selectedStudentAction = action;
  }

  // Loads the subjects shown in the student add/update dropdowns.
  loadSubjects(): void {
    this.loadingSubjects = true;

    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.loadingSubjects = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.subjects = [];
        this.loadingSubjects = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProfile(): void {
    this.loadingProfile = true;
    this.teacherService
      .getProfile()
      .pipe(finalize(() => { this.loadingProfile = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => { this.profile = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Error fetching teacher profile:', err)
      });
  }

  loadAssignedStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data.filter(s => !s.isDeleted);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching assigned students:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadSentMessages(): void {
    this.messageService.getTeacherSentMessages().subscribe({
      next: (data) => {
        this.sentMessages = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching sent messages:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadAssignedTasks(): void {
    this.taskService.getTasksAssignedByTeacher().subscribe({
      next: (tasks) => { this.assignedTasks = tasks; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading assigned task history:', err)
    });
  }

  showHistory(history: 'announcements' | 'tasks'): void {
    this.activeHistory = history;
    if (history === 'announcements') this.loadSentMessages();
    else this.loadAssignedTasks();
  }

  openTaskReply(task: TaskResponse): void {
    this.selectedTaskReply = task;
  }

  closeTaskReply(): void {
    this.selectedTaskReply = null;
  }

  sendMessage(): void {
    if (!this.selectedAnnouncementStudentIds.length || !this.newMessageText.trim()) {
      alert('Select at least one student and enter an announcement.');
      return;
    }

    this.sendingMessage = true;
    this.messageService
      .sendMessageToStudents(this.selectedAnnouncementStudentIds, { message: this.newMessageText.trim() })
      .pipe(finalize(() => { this.sendingMessage = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          alert('Message sent to student successfully!');
          this.newMessageText = '';
          this.selectedAnnouncementStudentIds = [];
          this.loadSentMessages();
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to send message.');
        }
      });
  }

  assignTask(): void {
    if (!this.selectedTaskStudentIds.length || !this.newTask.title.trim() || !this.newTask.description.trim() || !this.newTask.dueDate) {
      alert('Select students and provide a title, instructions, and due date.');
      return;
    }

    if (this.newTask.dueDate <= this.minimumDueDate) {
      alert('Due date must be later than today.');
      return;
    }

    this.assigningTask = true;
    this.uploadOptionalFile(this.taskAttachment).subscribe({
      next: (attachment) => this.createTasks(attachment?.fileName, attachment?.fileUrl),
      error: () => { this.assigningTask = false; alert('Failed to upload the task attachment.'); }
    });
  }

  private createTasks(attachmentName?: string, attachmentUrl?: string): void {
    const taskPayload = {
      title: this.newTask.title.trim(), description: this.newTask.description.trim(),
      dueDate: new Date(`${this.newTask.dueDate}T23:59:59`).toISOString(), type: 'CASE_STUDY', attachmentName, attachmentUrl
    };
    this.taskService
      .assignTaskToStudents(this.selectedTaskStudentIds, taskPayload)
      .pipe(finalize(() => { this.assigningTask = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          alert('Task assigned to student successfully!');
          this.newTask = { title: '', description: '', dueDate: '' };
          this.selectedTaskStudentIds = [];
          this.taskAttachment = null;
          this.taskAttachmentName = '';
          if (this.taskFileInput) this.taskFileInput.value = '';
          this.loadAssignedTasks();
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to assign task.');
        }
      });
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.taskFileInput = input;
    this.taskAttachment = file;
    this.taskAttachmentName = file?.name || '';
  }

  toggleStudentSelector(selector: 'announcement' | 'task'): void {
    this.openStudentSelector = this.openStudentSelector === selector ? null : selector;
  }

  toggleStudentSelection(selector: 'announcement' | 'task', studentId: number): void {
    const selected = this.studentIdsFor(selector);
    const position = selected.indexOf(studentId);
    if (position === -1) selected.push(studentId);
    else selected.splice(position, 1);
  }

  isStudentSelected(selector: 'announcement' | 'task', studentId: number | undefined): boolean {
    return studentId !== undefined && this.studentIdsFor(selector).includes(studentId);
  }

  studentSelectorLabel(selector: 'announcement' | 'task'): string {
    const selected = this.studentIdsFor(selector);
    if (!selected.length) return 'Choose students';
    if (selected.length === 1) return this.students.find(student => student.id === selected[0])?.name || '1 student selected';
    return `${selected.length} students selected`;
  }

  studentName(studentId: number | undefined): string {
    return this.students.find(student => student.id === studentId)?.name || 'Student';
  }

  private studentIdsFor(selector: 'announcement' | 'task'): number[] {
    return selector === 'announcement' ? this.selectedAnnouncementStudentIds
      : this.selectedTaskStudentIds;
  }

  get minimumDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private uploadOptionalFile(file: File | null): Observable<{ fileName: string; fileUrl: string } | null> {
    return file ? this.messageService.uploadAttachment(file) : of(null);
  }

  addStudent(form: NgForm): void {
    if (form.invalid || !this.newStudent.age || this.newStudent.age <= 0) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    if (this.selectedSubjectIds.length === 0) {
      alert('Please select at least one subject.');
      return;
    }

    const studentToAdd: Student = {
      name: this.newStudent.name,
      email: this.newStudent.email,
      username: this.newStudent.username?.trim(),
      password: this.newStudent.password,
      course: '',
      subjects: this.selectedSubjectIds.map(id => ({ id })),
      age: this.newStudent.age
    };

    this.studentService.addStudent(studentToAdd).subscribe({
      next: () => {
        alert('Student created and assigned to you successfully.');
        form.resetForm({ name: '', email: '', username: '', password: '', course: '', age: null });
        this.clearStudentForm();
        this.selectedSubjectIds = [];
        this.studentListRefreshKey++;
        this.selectedStudentAction = 'list';
        this.loadAssignedStudents();
        this.cdr.detectChanges();
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to add student.');
      }
    });
  }

  cancelAddStudent(form: NgForm): void {
    form.resetForm({ name: '', email: '', username: '', password: '', course: '', age: null });
    this.clearStudentForm();
    this.selectedStudentAction = '';
  }

  clearStudentForm(): void {
    this.newStudent = { name: '', email: '', username: '', password: '', course: '', age: null };
    this.selectedSubjectIds = [];
  }

  openStudentUpdateModal(student: Student): void {
    if (!student.id) return;
    this.selectedStudentForUpdate = student;
    this.updateStudent = {
      name: student.name,
      email: student.email,
      username: student.user?.username ?? student.username ?? '',
      password: '',
      course: student.course,
      age: student.age
    };
    this.updateSubjectIds = (student.subjects ?? [])
      .map(subject => subject.id)
      .filter((id): id is number => id !== undefined);
    this.showStudentUpdateModal = true;
    this.loadSubjects();
    this.cdr.detectChanges();
  }

  closeStudentUpdateModal(): void {
    this.showStudentUpdateModal = false;
    this.selectedStudentForUpdate = null;
    this.cdr.detectChanges();
  }

  saveStudentFromModal(form: NgForm): void {
    if (!this.selectedStudentForUpdate?.id || form.invalid) return;

    if (this.updateSubjectIds.length === 0) {
      alert('Please select at least one subject.');
      return;
    }

    const studentData: Student = {
      ...this.updateStudent,
      username: this.updateStudent.username?.trim(),
      subjects: this.updateSubjectIds.map(id => ({ id }))
    };

    this.studentService.updateStudent(this.selectedStudentForUpdate.id, studentData).subscribe({
      next: () => {
        alert('Student updated successfully.');
        this.closeStudentUpdateModal();
        this.studentListRefreshKey++;
        this.loadAssignedStudents();
        this.cdr.detectChanges();
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to update student.');
      }
    });
  }

  openStudentDeleteModal(student: Student): void {
    if (!student.id) return;
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
    if (!this.selectedStudentForDelete?.id) return;
    this.studentService.deleteStudent(this.selectedStudentForDelete.id).subscribe({
      next: () => {
        alert('Student soft-deleted successfully.');
        this.closeStudentDeleteModal();
        this.studentListRefreshKey++;
        this.loadAssignedStudents();
        this.cdr.detectChanges();
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to delete student.');
      }
    });
  }
}
