import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id?: number;
  name: string;
  email: string;
  course: string;
  age: number;
  teacher?: any;
}

export interface Teacher {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = 'http://localhost:8080/students';

  private userApiUrl = 'http://localhost:8080/users';

  

  constructor(private http: HttpClient) {}

  

  /* =========================
     STUDENT METHODS
  ========================= */

  getAllStudents(): Observable<Student[]> {

    return this.http.get<Student[]>(
      this.apiUrl
    );

  }


  addStudent(student: Student): Observable<Student> {

    return this.http.post<Student>(
      this.apiUrl,
      student
    );

  }


  getStudentById(id: number): Observable<Student> {

    return this.http.get<Student>(
      `${this.apiUrl}/${id}`
    );

  }


  updateStudent(
    id: number,
    student: Student
  ): Observable<Student> {

    return this.http.put<Student>(
      `${this.apiUrl}/${id}`,
      student
    );

  }


  deleteStudent(id: number): Observable<number> {

    return this.http.delete<number>(
      `${this.apiUrl}/${id}`
    );

  }


  /* =========================
     TEACHER METHODS
  ========================= */

  getAllTeachers(): Observable<Teacher[]> {

    return this.http.get<Teacher[]>(
      `${this.userApiUrl}/teachers`
    );

  }

}