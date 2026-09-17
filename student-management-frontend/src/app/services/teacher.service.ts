
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Teacher } from '../shared/models/teacher.model';

export type { Teacher } from '../shared/models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl = `${environment.apiBaseUrl}/users/teachers`;

  private userApiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  addTeacher(teacher: Teacher): Observable<Teacher> {

    return this.http.post<Teacher>(
      this.apiUrl,
      teacher
    );

  }

  getAllTeachers(): Observable<Teacher[]> {

    return this.http.get<Teacher[]>(
      this.apiUrl
    );

  }

  getTeacherById(id: number): Observable<Teacher> {

    return this.http.get<Teacher>(
      `${this.apiUrl}/${id}`
    );

  }

  updateTeacher(
    id: number,
    teacher: Teacher
  ): Observable<Teacher> {

    return this.http.put<Teacher>(
      `${this.apiUrl}/${id}`,
      teacher
    );

  }

  deleteTeacher(id: number): Observable<number> {

    return this.http.delete<number>(
      `${this.userApiUrl}/${id}`
    );

  }

  getProfile(): Observable<Teacher> {

    return this.http.get<Teacher>(
      `${this.userApiUrl}/profile`
    );

  }

}

