import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Auth } from '../../../../core/services/auth';
import { StudentService } from '../../../../services/student.service';
import { DocumentService } from '../../../../services/document.service';
import { TaskService } from '../../../../services/task.service';
import { Student as StudentModel } from '../../../../shared/models/student.model';
import { DocumentResponse } from '../../../../shared/models/document.model';
import { TaskResponse } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class Student implements OnInit {

  selectedSection: string = 'dashboard';
  username: string = '';
  role: string = '';

  // Profile data
  studentProfile: StudentModel | null = null;
  loadingProfile = false;

  // Documents data
  documents: DocumentResponse[] = [];
  loadingDocuments = false;

  // Tasks data
  tasks: TaskResponse[] = [];
  loadingTasks = false;

  // Case study submission
  selectedTaskToSubmit: TaskResponse | null = null;
  caseStudyTitle = '';
  caseStudyContent = '';
  caseStudyFile: File | null = null;
  submittingTask = false;

  constructor(
    private auth: Auth,
    private studentService: StudentService,
    private documentService: DocumentService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.role = localStorage.getItem('role') || '';
  }

  selectSection(section: string): void {
    this.selectedSection = section;
    this.clearSubmissionForm();

    if (section === 'profile') {
      this.loadProfile();
    } else if (section === 'documents') {
      this.loadDocuments();
    } else if (section === 'tasks') {
      this.loadTasks();
    }
  }

  logout(): void {
    this.auth.logout();
  }

  /* =========================
     PROFILE
  ========================= */

  loadProfile(): void {
    this.loadingProfile = true;
    this.studentService
      .getMyProfile()
      .pipe(finalize(() => { this.loadingProfile = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => {
          this.studentProfile = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching student profile:', err);
          this.cdr.detectChanges();
        }
      });
  }

  /* =========================
     DOCUMENTS
  ========================= */

  loadDocuments(): void {
    this.loadingDocuments = true;
    this.documentService
      .getMyDocuments()
      .pipe(finalize(() => { this.loadingDocuments = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => {
          this.documents = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching documents:', err);
          this.cdr.detectChanges();
        }
      });
  }

  markDocumentAsRead(documentId: number): void {
    this.documentService.markAsRead(documentId).subscribe({
      next: () => {
        const doc = this.documents.find(d => d.id === documentId);
        if (doc) doc.isRead = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error marking document as read:', err);
      }
    });
  }

  /* =========================
     TASKS
  ========================= */

  loadTasks(): void {
    this.loadingTasks = true;
    this.taskService
      .getMyTasks()
      .pipe(finalize(() => { this.loadingTasks = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => {
          this.tasks = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching tasks:', err);
          this.cdr.detectChanges();
        }
      });
  }

  markTaskAsRead(taskId: number): void {
    this.taskService.markTaskAsRead(taskId).subscribe({
      next: (updatedTask: any) => {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.isRead = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error marking task as read:', err);
      }
    });
  }

  /* =========================
     CASE STUDY SUBMISSION
  ========================= */

  openSubmissionForm(task: TaskResponse): void {
    this.selectedTaskToSubmit = task;
    this.caseStudyTitle = task.title;
    this.caseStudyContent = '';
    this.caseStudyFile = null;
    this.cdr.detectChanges();
  }

  clearSubmissionForm(): void {
    this.selectedTaskToSubmit = null;
    this.caseStudyTitle = '';
    this.caseStudyContent = '';
    this.caseStudyFile = null;
    this.submittingTask = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.caseStudyFile = input.files[0];
    } else {
      this.caseStudyFile = null;
    }
    this.cdr.detectChanges();
  }

  submitCaseStudy(): void {
    if (!this.selectedTaskToSubmit || !this.selectedTaskToSubmit.id) {
      return;
    }

    if (!this.caseStudyFile) {
      alert('Please select a file to submit.');
      return;
    }

    this.submittingTask = true;

    const fileUrl = this.caseStudyFile.name;
    const fileName = this.caseStudyFile.name;

    this.taskService
      .submitTask(this.selectedTaskToSubmit.id, fileUrl, fileName)
      .pipe(finalize(() => {
        this.submittingTask = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          alert('Case study submitted successfully!');
          this.clearSubmissionForm();
          const task = this.tasks.find(t => t.id === this.selectedTaskToSubmit?.id);
          if (task) task.isSubmitted = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error submitting case study:', err);
          const msg = err.error?.message || 'Failed to submit case study.';
          alert(msg);
          this.cdr.detectChanges();
        }
      });
  }
}
