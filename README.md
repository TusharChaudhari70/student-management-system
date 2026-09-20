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

Open `Student_Management/.env` and replace every placeholder password and secret. For a fresh installation, configure the first Admin account:

```env
INITIAL_ADMIN_ENABLED=true
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=Admin@12345
INITIAL_ADMIN_NAME=Administrator
```

Use a strong, unique password instead of the example above. Never commit `Student_Management/.env`.

### 2. Start the application

```powershell
docker compose up --build -d
```

Open:

- Frontend: http://localhost:4200
- API Swagger: http://localhost:8080/swagger-ui.html

For a fresh database, sign in with the Admin username and password configured in `.env`. The Admin is created only when no Admin exists, so existing accounts are never replaced.

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

To use existing users/data on another machine, transfer a SQL Server `.bak` backup privately and restore it into the Docker SQL Server. Do not upload database backups to GitHub.

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
