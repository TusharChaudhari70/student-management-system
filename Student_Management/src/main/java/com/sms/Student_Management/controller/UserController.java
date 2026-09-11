package com.sms.Student_Management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ================================
    // USER PROFILE API
    // ================================

    @GetMapping("/profile")
    public User getProfile(Authentication authentication) {
        return userService.getProfile(authentication.getName());
    }

    // ================================
    // EXISTING USER APIs
    // ================================

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails) {

        return userService.updateUser(id, userDetails);
    }

    @DeleteMapping("/{id}")
    public Long deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }


    // ================================
    // TEACHER APIs
    // ================================

    // Get all teachers
    @GetMapping("/teachers")
    public List<User> getAllTeachers() {
        return userService.getAllTeachers();
    }

    // Add teacher
    @PostMapping("/teachers")
    public User createTeacher(@RequestBody User user) {
        return userService.createTeacher(user);
    }

    // Get teacher by ID
    @GetMapping("/teachers/{id}")
    public User getTeacherById(@PathVariable Long id) {
        return userService.getTeacherById(id);
    }

    // Update teacher
    @PutMapping("/teachers/{id}")
    public User updateTeacher(
            @PathVariable Long id,
            @RequestBody User teacherDetails) {

        return userService.updateTeacher(id, teacherDetails);
    }

    // ================================
    // STUDENT APIs
    // ================================

    // Get all students
    @GetMapping("/students")
    public List<User> getAllStudents() {
        return userService.getAllStudents();
    }

    // Create student
    @PostMapping("/students")
    public User createStudent(@RequestBody User user) {
        return userService.createStudent(user);
    }

    // Get student by ID
    @GetMapping("/students/{id}")
    public User getStudentById(@PathVariable Long id) {
        return userService.getStudentById(id);
    }

    // Update student
    @PutMapping("/students/{id}")
    public User updateStudent(
            @PathVariable Long id,
            @RequestBody User studentDetails) {

        return userService.updateStudent(id, studentDetails);
    }
}