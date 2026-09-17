import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task, TaskResponse } from '../shared/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  assignTaskToStudent(studentId: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/assign/${studentId}`, task);
  }

  assignTaskToStudents(studentIds: number[], task: Task): Observable<Task[]> {
    const params = studentIds.reduce((value, id) => value.append('studentIds', id), new HttpParams());
    return this.http.post<Task[]>(`${this.apiUrl}/assign`, task, { params });
  }

  assignTaskByAdmin(studentId: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/admin/assign/${studentId}`, task);
  }

  getMyTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/my-tasks`);
  }

  getTasksAssignedByTeacher(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/assigned-by-me`);
  }

  getTasksForStudent(studentId: number): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/student/${studentId}`);
  }

  submitTask(taskId: number, fileUrl?: string, fileName?: string, submissionText?: string): Observable<Task> {
    let params = new HttpParams();
    if (fileUrl) params = params.set('fileUrl', fileUrl);
    if (fileName) params = params.set('fileName', fileName);
    if (submissionText?.trim()) params = params.set('submissionText', submissionText.trim());

    return this.http.post<Task>(`${this.apiUrl}/${taskId}/submit`, null, { params });
  }

  markTaskAsRead(taskId: number): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${taskId}/read`, {});
  }
}
