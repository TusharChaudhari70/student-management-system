import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from '../shared/models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private apiUrl = 'http://localhost:8080/subjects';

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.apiUrl);
  }

  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject);
  }

  updateSubject(id: number, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${id}`, subject);
  }

  deleteSubject(id: number): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/${id}`);
  }
}
