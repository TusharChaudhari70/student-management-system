import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Document, DocumentResponse } from '../shared/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiUrl = 'http://localhost:8080/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(document: Document): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/upload`, document);
  }

  uploadDocumentToStudent(studentId: number, document: Document): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/${studentId}/upload`, document);
  }

  getMyDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/my-documents`);
  }

  getDocumentsForStudent(studentId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getDocumentsUploadedByTeacher(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/teacher`);
  }

  markAsRead(documentId: number): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${documentId}/read`, {});
  }
}
