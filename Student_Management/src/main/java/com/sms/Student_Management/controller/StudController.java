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

import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.service.StudService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/students")
@SecurityRequirement(name = "bearerAuth")
public class StudController {

    private final StudService studService;

    public StudController(StudService studService) {
        this.studService = studService;
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studService.createStudent(student);
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studService.getAllStudents();
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studService.getStudentById(id);
    }

    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @RequestBody Student studentDetails) {
        return studService.updateStudent(id, studentDetails);
    }

    @DeleteMapping("/{id}")
    public Long deleteStudent(@PathVariable Long id) {
        return studService.deleteStudent(id);
    }

    @PostMapping("/addAll")
public List<Student> createStudents(@RequestBody List<Student> students) {
    return studService.createStudents(students);
}
}