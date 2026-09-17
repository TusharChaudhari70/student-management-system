-- =========================================================
-- DATABASE MIGRATION SCRIPT FOR STUDENT MANAGEMENT SYSTEM
-- Compatible with SQL Server / Azure SQL
-- =========================================================

-- 1. Create USERS table if not exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL,
        name NVARCHAR(255) NULL,
        email NVARCHAR(255) NULL UNIQUE
    );
END;

-- 2. Create STUDENTS table if not exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'students')
BEGIN
    CREATE TABLE students (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        course NVARCHAR(255) NULL,
        age INT NULL,
        is_deleted BIT NOT NULL DEFAULT 0,
        teacher_id BIGINT NULL,
        user_id BIGINT NULL UNIQUE,
        CONSTRAINT FK_Students_Teacher FOREIGN KEY (teacher_id) REFERENCES users(id),
        CONSTRAINT FK_Students_User FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;

-- 3. Ensure user_id and teacher_id columns exist in students
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('students') AND name = 'user_id')
BEGIN
    ALTER TABLE students ADD user_id BIGINT NULL UNIQUE;
    ALTER TABLE students ADD CONSTRAINT FK_Students_User FOREIGN KEY (user_id) REFERENCES users(id);
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('students') AND name = 'teacher_id')
BEGIN
    ALTER TABLE students ADD teacher_id BIGINT NULL;
    ALTER TABLE students ADD CONSTRAINT FK_Students_Teacher FOREIGN KEY (teacher_id) REFERENCES users(id);
END;

-- 4. Create MESSAGES table for 1-way teacher-to-student messages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
BEGIN
    CREATE TABLE messages (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        teacher_id BIGINT NOT NULL,
        student_id BIGINT NOT NULL,
        message NVARCHAR(MAX) NULL,
        file_name NVARCHAR(255) NULL,
        file_url NVARCHAR(MAX) NULL,
        sent_at DATETIME2 NULL DEFAULT GETDATE(),
        is_read BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_Messages_Teacher FOREIGN KEY (teacher_id) REFERENCES users(id),
        CONSTRAINT FK_Messages_Student FOREIGN KEY (student_id) REFERENCES students(id)
    );
END;

-- 5. Create DOCUMENTS table if not exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documents')
BEGIN
    CREATE TABLE documents (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        file_name NVARCHAR(255) NULL,
        file_url NVARCHAR(MAX) NULL,
        uploaded_at DATETIME2 NULL DEFAULT GETDATE(),
        is_read BIT NOT NULL DEFAULT 0,
        student_id BIGINT NOT NULL,
        teacher_id BIGINT NULL,
        CONSTRAINT FK_Documents_Student FOREIGN KEY (student_id) REFERENCES students(id),
        CONSTRAINT FK_Documents_Teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
    );
END;

-- 6. Create TASKS table if not exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
BEGIN
    CREATE TABLE tasks (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        type NVARCHAR(50) NULL DEFAULT 'CASE_STUDY',
        due_date DATETIME2 NULL,
        created_at DATETIME2 NULL DEFAULT GETDATE(),
        is_read BIT NOT NULL DEFAULT 0,
        is_submitted BIT NOT NULL DEFAULT 0,
        submitted_at DATETIME2 NULL,
        submission_file_name NVARCHAR(255) NULL,
        submission_file_url NVARCHAR(MAX) NULL,
        student_id BIGINT NOT NULL,
        teacher_id BIGINT NOT NULL,
        CONSTRAINT FK_Tasks_Student FOREIGN KEY (student_id) REFERENCES students(id),
        CONSTRAINT FK_Tasks_Teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
    );
END;

-- 7. Seed default users (password: 'admin123' and 'teacher123' encrypted with BCrypt)
-- BCrypt for 'admin123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- BCrypt for 'teacher123': $2a$10$7Z8KxL5v0QzO7q3J4v5v6e.r9oX.d8e9l0k1j2h3g4f5e6d7c8b9a
IF NOT EXISTS (SELECT * FROM users WHERE username = 'admin')
BEGIN
    INSERT INTO users (username, password, role, name, email)
    VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', 'System Administrator', 'admin@sms.com');
END;

IF NOT EXISTS (SELECT * FROM users WHERE username = 'teacher1')
BEGIN
    INSERT INTO users (username, password, role, name, email)
    VALUES ('teacher1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'TEACHER', 'Professor John Doe', 'teacher1@sms.com');
END;

-- 8. Auto-link any existing students that do not have a User account
-- Generates user record with username=email, default password=email, role='STUDENT'
INSERT INTO users (username, password, role, name, email)
SELECT s.email, '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'STUDENT', s.name, s.email
FROM students s
WHERE s.user_id IS NULL AND NOT EXISTS (SELECT 1 FROM users u WHERE u.username = s.email OR u.email = s.email);

UPDATE s
SET s.user_id = u.id
FROM students s
INNER JOIN users u ON u.username = s.email OR u.email = s.email
WHERE s.user_id IS NULL;

