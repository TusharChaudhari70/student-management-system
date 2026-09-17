import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Auth } from '../../../../core/services/auth';
import { StudentService } from '../../../../services/student.service';
import { DocumentService } from '../../../../services/document.service';
import { TaskService } from '../../../../services/task.service';
import { MessageService } from '../../../../core/services/message.service';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Student as StudentModel } from '../../../../shared/models/student.model';
import { DocumentResponse } from '../../../../shared/models/document.model';
import { TaskResponse } from '../../../../shared/models/task.model';
import { Message } from '../../../../shared/models/message.model';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [FormsModule, CommonModule, Navbar],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class Student implements OnInit {

  selectedSection: string = 'dashboard';
  username: string = '';
  role: string = '';

  // Profile
  studentProfile: StudentModel | null = null;
  loadingProfile = false;

  // Documents
  documents: DocumentResponse[] = [];
  loadingDocuments = false;

  // Tasks
  tasks: TaskResponse[] = [];
  loadingTasks = false;

  // Messages
  messages: Message[] = [];
  loadingMessages = false;

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
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.role = localStorage.getItem('role') || 'STUDENT';
    this.loadProfile();
    this.loadMessages();
    this.loadTasks();
    this.loadDocuments();
  }

  get unreadMessagesCount(): number {
    return this.messages.filter(m => !m.isRead).length;
  }

  // Readable subject list for the profile card
  get subjectNames(): string {
    return (this.studentProfile?.subjects ?? [])
      .map(subject => subject.name)
      .filter((name): name is string => !!name)
      .join(', ');
  }

  get pendingTasksCount(): number {
    return this.tasks.filter(t => !t.isSubmitted).length;
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
    } else if (section === 'messages') {
      this.loadMessages();
    }
  }

  logout(): void {
    this.auth.logout();
  }

  loadProfile(): void {
    this.loadingProfile = true;
    this.studentService
      .getMyProfile()
      .pipe(finalize(() => { this.loadingProfile = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => { this.studentProfile = data; this.cdr.detectChanges(); },
        error: (err) => { console.error('Profile error:', err); this.cdr.detectChanges(); }
      });
  }

  loadMessages(): void {
    this.loadingMessages = true;
    this.messageService
      .getMyMessages()
      .pipe(finalize(() => { this.loadingMessages = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => { this.messages = data; this.cdr.detectChanges(); },
        error: (err) => { console.error('Messages error:', err); this.cdr.detectChanges(); }
      });
  }

  markMessageAsRead(messageId?: number): void {
    if (!messageId) return;
    this.messageService.markAsRead(messageId).subscribe({
      next: () => {
        const msg = this.messages.find(m => m.id === messageId);
        if (msg) msg.isRead = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadDocuments(): void {
    this.loadingDocuments = true;
    this.documentService
      .getMyDocuments()
      .pipe(finalize(() => { this.loadingDocuments = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => { this.documents = data; this.cdr.detectChanges(); },
        error: (err) => { console.error('Documents error:', err); this.cdr.detectChanges(); }
      });
  }

  markDocumentAsRead(documentId: number): void {
    this.documentService.markAsRead(documentId).subscribe({
      next: () => {
        const doc = this.documents.find(d => d.id === documentId);
        if (doc) doc.isRead = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadTasks(): void {
    this.loadingTasks = true;
    this.taskService
      .getMyTasks()
      .pipe(finalize(() => { this.loadingTasks = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (data) => { this.tasks = data; this.cdr.detectChanges(); },
        error: (err) => { console.error('Tasks error:', err); this.cdr.detectChanges(); }
      });
  }

  markTaskAsRead(taskId: number): void {
    this.taskService.markTaskAsRead(taskId).subscribe({
      next: () => {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.isRead = true;
        this.cdr.detectChanges();
      }
    });
  }

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
    this.caseStudyFile = (input.files && input.files.length > 0) ? input.files[0] : null;
    this.cdr.detectChanges();
  }

  submitCaseStudy(): void {
    if (!this.selectedTaskToSubmit?.id || (!this.caseStudyFile && !this.caseStudyContent.trim())) return;

    this.submittingTask = true;
    const submit = (fileUrl?: string, fileName?: string) => this.taskService
      .submitTask(this.selectedTaskToSubmit!.id, fileUrl, fileName, this.caseStudyContent);
    const request = this.caseStudyFile
      ? this.messageService.uploadAttachment(this.caseStudyFile)
      : null;

    const submitRequest = (fileUrl?: string, fileName?: string) => submit(fileUrl, fileName)
      .pipe(finalize(() => { this.submittingTask = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          alert('Case study submitted successfully!');
          const id = this.selectedTaskToSubmit?.id;
          this.clearSubmissionForm();
          const task = this.tasks.find(t => t.id === id);
          if (task) task.isSubmitted = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to submit case study.');
          this.cdr.detectChanges();
        }
      });

    if (request) {
      request.subscribe({
        next: (file) => submitRequest(file.fileUrl, file.fileName),
        error: () => { this.submittingTask = false; alert('Failed to upload the attachment.'); }
      });
    } else {
      submitRequest();
    }
  }
}
