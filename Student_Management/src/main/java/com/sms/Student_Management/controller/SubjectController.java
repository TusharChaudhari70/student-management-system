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

import com.sms.Student_Management.entity.Subject;
import com.sms.Student_Management.service.SubjectService;

@RestController
@RequestMapping("/subjects")
public class SubjectController {

private static final Logger log =
        LoggerFactory.getLogger(SubjectController.class);

private final SubjectService subjectService;

public SubjectController(SubjectService subjectService) {
    this.subjectService = subjectService;
}

@GetMapping
public List<Subject> getAllSubjects() {
    log.info("Request to get all subjects");
    return subjectService.getAllSubjects();
}

@PostMapping
public Subject createSubject(@RequestBody Subject subject) {
    log.info("Creating subject");
    return subjectService.createSubject(subject);
}

@PutMapping("/{id}")
public Subject updateSubject(
        @PathVariable Long id,
        @RequestBody Subject subject) {

    log.info("Updating subject with ID: {}", id);
    return subjectService.updateSubject(id, subject);
}

@DeleteMapping("/{id}")
public Long deleteSubject(@PathVariable Long id) {

    log.info("Deleting subject with ID: {}", id);
    return subjectService.deleteSubject(id);
}

}
