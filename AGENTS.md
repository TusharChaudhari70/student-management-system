# AGENTS.md

## Project Overview
Student Management System - a Spring Boot backend with Angular frontend for managing students, teachers, and documents.

## Project Structure

```
SbootPr/
├── Student_Management/                  (Spring Boot backend)
└── student-management-frontend/         (Angular frontend)
```

## Build Commands

### Backend (Spring Boot)
```bash
cd Student_Management
mvn spring-boot:run                    # Run the backend server
mvn clean install                      # Build and install
mvn test                               # Run tests
```

- Backend runs on: `http://localhost:8080`
- Database: SQL Server (localhost:1433, database: StudentManagementDB)
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Frontend (Angular)
```bash
cd student-management-frontend
ng serve                               # Run dev server on http://localhost:4200
ng build                               # Production build
ng test                                # Run unit tests
ng lint                                # Run linting
```

- Frontend runs on: `http://localhost:4200`
- CORS configured for `http://localhost:4200`

## API Authentication
- POST `/auth/login` with `{ username, password }` returns `{ username, role, token }`
- Store JWT token in localStorage as `token`
- Send as `Authorization: Bearer <token>` header
- Frontend AuthInterceptor handles this automatically

## Roles
- `ADMIN` - Full access to all endpoints
- `TEACHER` - Manage own students, view documents/tasks
- `STUDENT` - View own profile, documents, tasks; submit case studies

## Key Endpoints

### Auth
- `POST /auth/login` - Login

### Students
- `GET /students/my-profile` - Get current student's profile (STUDENT role)
- `GET /students` - List all students (ADMIN/TEACHER)
- `POST /students` - Create student
- `GET /students/{id}` - Get student by ID
- `PUT /students/{id}` - Update student
- `DELETE /students/{id}` - Soft-delete student

### Users
- `GET /users/profile` - Get current user profile (ADMIN/TEACHER/STUDENT)
- `GET /users/teachers` - Get all teachers (ADMIN)
- `POST /users/teachers` - Create teacher (ADMIN)

### Documents
- `POST /documents/upload` - Upload document as student (STUDENT)
- `POST /documents/{studentId}/upload` - Teacher uploads to student (TEACHER)
- `GET /documents/my-documents` - Get own documents (STUDENT)
- `GET /documents/teacher` - Get documents uploaded by teacher (TEACHER)
- `GET /documents/student/{studentId}` - Get student's documents (ADMIN/TEACHER)
- `PUT /documents/{documentId}/read` - Mark as read (STUDENT)

### Tasks
- `POST /tasks/assign/{studentId}` - Teacher assigns task (TEACHER)
- `POST /tasks/admin/assign/{studentId}` - Admin assigns task (ADMIN)
- `GET /tasks/my-tasks` - Get own tasks (STUDENT)
- `GET /tasks/assigned-by-me` - Get tasks assigned by teacher (TEACHER)
- `GET /tasks/student/{studentId}` - Get student's tasks (ADMIN/TEACHER)
- `POST /tasks/{taskId}/submit?fileUrl=...&fileName=...` - Submit case study (STUDENT)
- `PUT /tasks/{taskId}/read` - Mark task as read (STUDENT)

## Testing

### Backend Tests
```bash
cd Student_Management
mvn test
```

### Frontend Tests
```bash
cd student-management-frontend
ng test
```
