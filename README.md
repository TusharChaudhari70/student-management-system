# Student Management System

A full-stack Student Management System with a Spring Boot API, Angular frontend, and SQL Server database.

## Quick start with Docker (recommended)

### Requirements

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and make sure it is running. No separate Java, Node.js, Angular, or SQL Server installation is required.

### 1. Create your local environment file

From the project root:

```powershell
Copy-Item .env.docker.example Student_Management\.env
```

Open `Student_Management/.env` and replace the database passwords and JWT secret. The committed Docker example enables local test accounts so a new clone is ready to use immediately.

```env
INITIAL_ADMIN_ENABLED=true
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=Admin@12345
INITIAL_ADMIN_NAME=Administrator
```

Never commit `Student_Management/.env`. The included login passwords are deliberately predictable for local testing only; change them or disable demo data before sharing a deployed environment.

### 2. Start the application

```powershell
docker compose up --build -d
```

Open:

- Frontend: http://localhost:4200
- API Swagger: http://localhost:8080/swagger-ui.html

For a fresh database, these accounts are created automatically. Existing accounts are never changed or duplicated.

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `Admin@12345` |
| Teacher | `teacher1` | `Demo@12345` |
| Teacher | `teacher2` | `Demo@12345` |
| Student | `student1` | `Demo@12345` |
| Student | `student2` | `Demo@12345` |

Set `DEMO_DATA_ENABLED=false` in `Student_Management/.env` to skip the teacher/student test data. Set `INITIAL_ADMIN_ENABLED=false` to skip the initial Admin. To recreate the full demo database, run `docker compose down -v` and start the stack again.

### Everyday Docker commands

```powershell
# Start after it was stopped
docker compose up -d

# Rebuild after changing Java, Angular, Dockerfile, or Compose code
docker compose up --build -d

# Check running services
docker compose ps

# View logs
docker compose logs -f

# Stop containers but keep database and uploaded files
docker compose down

# Remove containers, database, and uploaded files (fresh start)
docker compose down -v
```

## Run without Docker

### Requirements

- Java 21
- Maven
- Node.js and npm
- SQL Server running on port `1433`

### 1. Configure the backend

```powershell
Copy-Item Student_Management\.env.example Student_Management\.env
```

Update `Student_Management/.env` with your SQL Server connection details, JWT secret, CORS URL, and optional first Admin settings. For local manual development, set `DB_URL` to your local SQL Server, for example:

```env
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=StudentManagementDB;encrypt=true;trustServerCertificate=true
```

Create the `StudentManagementDB` database and ensure `DB_USERNAME` has access to it. Liquibase creates the application tables when the backend starts.

### 2. Start the backend

```powershell
cd Student_Management
mvn spring-boot:run
```

The API runs at http://localhost:8080.

### 3. Start the frontend

Open a second terminal:

```powershell
cd student-management-frontend
npm install
npm start
```

The frontend runs at http://localhost:4200.

## Existing database data

Docker creates a separate SQL Server database. It does not automatically copy users from a local SQL Server instance.


## Project structure

```text
Student_Management/            Spring Boot backend
student-management-frontend/  Angular frontend
docker-compose.yml            Docker services and networking
```

## Security notes

- Keep `Student_Management/.env` private.
- Do not commit passwords, JWT secrets, logs, uploaded documents, or database backups.
- Change example passwords before sharing or deployment.
