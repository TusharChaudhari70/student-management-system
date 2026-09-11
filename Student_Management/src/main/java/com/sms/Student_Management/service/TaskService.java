package com.sms.Student_Management.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.Task;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.TaskRepo;
import com.sms.Student_Management.repository.UserRepo;

@Service
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepo taskRepo;
    private final StudRepo studRepo;
    private final UserRepo userRepo;
    private final DocumentService documentService;

    public TaskService(TaskRepo taskRepo, StudRepo studRepo, UserRepo userRepo, DocumentService documentService) {
        this.taskRepo = taskRepo;
        this.studRepo = studRepo;
        this.userRepo = userRepo;
        this.documentService = documentService;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));
    }

    /**
     * Teacher assigns a task to a student.
     */
    @PreAuthorize("hasRole('TEACHER')")
    public Task assignTaskToStudent(Long studentId, Task task) {
        String username = getCurrentUsername();
        log.info("Teacher {} assigning task to student ID: {}", username, studentId);

        User teacher = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + username));

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        if (!student.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only assign tasks to your own students");
        }

        task.setStudent(student);
        task.setTeacher(teacher);
        task.setCreatedAt(LocalDateTime.now());
        task.setIsRead(false);
        task.setIsSubmitted(false);

        if (task.getType() == null) {
            task.setType("CASE_STUDY");
        }

        Task saved = taskRepo.save(task);
        log.info("Task assigned with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Admin assigns a task to a student (any student).
     */
    @PreAuthorize("hasRole('ADMIN')")
    public Task assignTaskByAdmin(Long studentId, Task task) {
        log.info("Admin assigning task to student ID: {}", studentId);

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        task.setStudent(student);
        task.setCreatedAt(LocalDateTime.now());
        task.setIsRead(false);
        task.setIsSubmitted(false);

        if (task.getType() == null) {
            task.setType("CASE_STUDY");
        }

        if (task.getTeacher() == null) {
            task.setTeacher(student.getTeacher());
        }

        Task saved = taskRepo.save(task);
        log.info("Task assigned with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Get all tasks for the current student.
     */
    @PreAuthorize("hasRole('STUDENT')")
    public List<Task> getMyTasks() {
        String username = getCurrentUsername();
        log.info("Fetching tasks for student: {}", username);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Student student = studRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student not found for user: " + username));

        List<Task> tasks = taskRepo.findByStudentOrderByCreatedAtDesc(student);
        log.info("Student {} has {} tasks", username, tasks.size());
        return tasks;
    }

    /**
     * Get all tasks assigned by the current teacher.
     */
    @PreAuthorize("hasRole('TEACHER')")
    public List<Task> getTasksAssignedByTeacher() {
        String username = getCurrentUsername();
        log.info("Fetching tasks assigned by teacher: {}", username);

        User teacher = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + username));

        List<Task> tasks = taskRepo.findByTeacherOrderByCreatedAtDesc(teacher);
        log.info("Teacher {} has assigned {} tasks", username, tasks.size());
        return tasks;
    }

    /**
     * Get all tasks for a given student (admin/teacher only).
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Task> getTasksForStudent(Long studentId) {
        String username = getCurrentUsername();
        log.info("Fetching tasks for student ID: {} by user: {}", studentId, username);

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        if (isTeacher()) {
            User teacher = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found: " + username));

            if (!student.getTeacher().getId().equals(teacher.getId())) {
                throw new RuntimeException("You can only view tasks for your own students");
            }
        }

        List<Task> tasks = taskRepo.findByStudentOrderByCreatedAtDesc(student);
        log.info("Fetched {} tasks for student ID: {}", tasks.size(), studentId);
        return tasks;
    }

    /**
     * Student submits a case study for a task (stored as a Document linked to the task).
     * The submission is saved as a Document with the student's teacher as recipient.
     */
    @PreAuthorize("hasRole('STUDENT')")
    public Task submitTask(Long taskId, String fileUrl, String fileName) {
        String username = getCurrentUsername();
        log.info("Student {} submitting task ID: {}", username, taskId);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Student student = studRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student not found for user: " + username));

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (!task.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("You can only submit your own tasks");
        }

        task.setIsSubmitted(true);

        if (fileUrl != null && fileName != null) {
            com.sms.Student_Management.entity.Document document = new com.sms.Student_Management.entity.Document();
            document.setStudent(student);
            document.setTeacher(student.getTeacher());
            document.setTitle("Case Study Submission: " + task.getTitle());
            document.setDescription(task.getDescription());
            document.setFileName(fileName);
            document.setFileUrl(fileUrl);
            document.setUploadedAt(LocalDateTime.now());
            document.setIsRead(false);

            documentService.uploadDocument(student.getId(), document);
        }

        Task saved = taskRepo.save(task);
        log.info("Task ID: {} submitted successfully", taskId);
        return saved;
    }

    /**
     * Mark a task as read by the student.
     */
    @PreAuthorize("hasRole('STUDENT')")
    public Task markTaskAsRead(Long taskId) {
        String username = getCurrentUsername();
        log.info("Student {} marking task ID: {} as read", username, taskId);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Student student = studRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student not found for user: " + username));

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (!task.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("You can only update your own tasks");
        }

        task.setIsRead(true);
        return taskRepo.save(task);
    }
}
