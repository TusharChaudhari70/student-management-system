package com.sms.Student_Management.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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


@RestController
@RequestMapping("/students")
public class StudController {

    private static final Logger log =
            LoggerFactory.getLogger(StudController.class);

    private final StudService studService;

    public StudController(StudService studService) {
        this.studService = studService;
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {

        log.info("Creating a new student");

        return studService.createStudent(student);
    }

    @GetMapping
    public List<Student> getAllStudents() {

        log.info("Fetching all students");

        return studService.getAllStudents();
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {

        log.info("Fetching student with ID: {}", id);

        return studService.getStudentById(id);
    }

    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @RequestBody Student studentDetails) {

        log.info("Updating student with ID: {}", id);

        return studService.updateStudent(id, studentDetails);
    }

    @DeleteMapping("/{id}")
    public Long deleteStudent(@PathVariable Long id) {

        log.info("Deleting student with ID: {}", id);

        return studService.deleteStudent(id);
    }

    @PostMapping("/addAll")
    public List<Student> createStudents(
            @RequestBody List<Student> students) {

        log.info("Creating {} students", students.size());

        return studService.createStudents(students);
    }
}