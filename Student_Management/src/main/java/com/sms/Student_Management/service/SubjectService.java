package com.sms.Student_Management.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sms.Student_Management.entity.Subject;
import com.sms.Student_Management.repository.SubjectRepo;

@Service
public class SubjectService {

    private static final Logger log = LoggerFactory.getLogger(SubjectService.class);

    private final SubjectRepo subjectRepo;

    public SubjectService(SubjectRepo subjectRepo) {
        this.subjectRepo = subjectRepo;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public List<Subject> getAllSubjects() {
        List<Subject> subjects = subjectRepo.findAll();
        log.info("Fetched {} subjects", subjects.size());
        return subjects;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Transactional
    public Subject createSubject(Subject subject) {
        if (subject.getName() == null || subject.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject name cannot be empty");
        }
        
        if (subjectRepo.findByName(subject.getName().trim()).isPresent()) {
            throw new IllegalArgumentException("Subject with name '" + subject.getName() + "' already exists");
        }
        
        subject.setName(subject.getName().trim());
        Subject saved = subjectRepo.save(subject);
        log.info("Created subject with ID: {}", saved.getId());
        return saved;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Transactional
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = subjectRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        if (subjectDetails.getName() == null || subjectDetails.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject name cannot be empty");
        }
        
        // Check if another subject has this name
        subjectRepo.findByName(subjectDetails.getName().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Subject with name '" + subjectDetails.getName() + "' already exists");
            }
        });
        
        subject.setName(subjectDetails.getName().trim());
        Subject updated = subjectRepo.save(subject);
        log.info("Updated subject with ID: {}", updated.getId());
        return updated;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Transactional
    public Long deleteSubject(Long id) {
        if (!subjectRepo.existsById(id)) {
            throw new IllegalArgumentException("Subject not found with ID: " + id);
        }
        
        Subject subject = subjectRepo.findById(id).orElseThrow();
        if (subject.getStudents() != null && !subject.getStudents().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete subject that is assigned to students");
        }
        
        subjectRepo.delete(subject);
        log.info("Deleted subject with ID: {}", id);
        return id;
    }
}