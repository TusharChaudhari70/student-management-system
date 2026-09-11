import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../shared/models/student.model';

export type { Student } from '../shared/models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = 'http://localhost:8080/students';

  

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

    const payload: Student = {
      ...student,
      isDeleted: student.isDeleted ?? false
    };

    return this.http.post<Student>(
      this.apiUrl,
      payload
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
     STUDENT SELF-SERVICE METHODS
  ========================= */

  getMyProfile(): Observable<Student> {
    return this.http.get<Student>(
      `${this.apiUrl}/my-profile`
    );
  }
}
