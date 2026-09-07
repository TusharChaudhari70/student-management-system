
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Teacher } from './student.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl = 'http://localhost:8080/users/teachers';

  private userApiUrl = 'http://localhost:8080/users';

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

}

