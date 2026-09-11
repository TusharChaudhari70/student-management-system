package com.sms.Student_Management.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sms.Student_Management.entity.Task;
import com.sms.Student_Management.service.TaskService;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private static final Logger log = LoggerFactory.getLogger(TaskController.class);

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Teacher assigns a task to a student.
     */
    @PostMapping("/assign/{studentId}")
    public Task assignTaskToStudent(
            @PathVariable Long studentId,
            @RequestBody Task task) {
        log.info("Assigning task to student ID: {}", studentId);
        return taskService.assignTaskToStudent(studentId, task);
    }

    /**
     * Admin assigns a task to a student.
     */
    @PostMapping("/admin/assign/{studentId}")
    public Task assignTaskByAdmin(
            @PathVariable Long studentId,
            @RequestBody Task task) {
        log.info("Admin assigning task to student ID: {}", studentId);
        return taskService.assignTaskByAdmin(studentId, task);
    }

    /**
     * Get all tasks for the current student.
     */
    @GetMapping("/my-tasks")
    public List<Task> getMyTasks() {
        log.info("Fetching tasks for current student");
        return taskService.getMyTasks();
    }

    /**
     * Get all tasks assigned by the current teacher.
     */
    @GetMapping("/assigned-by-me")
    public List<Task> getTasksAssignedByTeacher() {
        log.info("Fetching tasks assigned by current teacher");
        return taskService.getTasksAssignedByTeacher();
    }

    /**
     * Get all tasks for a given student (admin/teacher only).
     */
    @GetMapping("/student/{studentId}")
    public List<Task> getTasksForStudent(@PathVariable Long studentId) {
        log.info("Fetching tasks for student ID: {}", studentId);
        return taskService.getTasksForStudent(studentId);
    }

    /**
     * Student submits a task (case study).
     */
    @PostMapping("/{taskId}/submit")
    public Task submitTask(
            @PathVariable Long taskId,
            @RequestParam(required = false) String fileUrl,
            @RequestParam(required = false) String fileName) {
        log.info("Submitting task ID: {}", taskId);
        return taskService.submitTask(taskId, fileUrl, fileName);
    }

    /**
     * Student marks a task as read.
     */
    @PutMapping("/{taskId}/read")
    public Task markTaskAsRead(@PathVariable Long taskId) {
        log.info("Marking task ID: {} as read", taskId);
        return taskService.markTaskAsRead(taskId);
    }
}
