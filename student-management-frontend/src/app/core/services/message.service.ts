import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly baseUrl = 'http://localhost:8080/messages';

  constructor(private http: HttpClient) {}

  sendMessage(studentId: number, message: Partial<Message>): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/send/${studentId}`, message);
  }

  sendMessageToStudents(studentIds: number[], message: Partial<Message>): Observable<Message[]> {
    const params = studentIds.reduce((value, id) => value.append('studentIds', id), new HttpParams());
    return this.http.post<Message[]>(`${this.baseUrl}/send`, message, { params });
  }

  uploadAttachment(file: File): Observable<{ fileName: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileName: string; fileUrl: string }>('http://localhost:8080/files/upload', formData);
  }

  getMyMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/my-messages`);
  }

  getTeacherSentMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/teacher/sent`);
  }

  markAsRead(messageId: number): Observable<Message> {
    return this.http.put<Message>(`${this.baseUrl}/${messageId}/read`, {});
  }
}
