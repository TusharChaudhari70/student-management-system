package com.sms.Student_Management.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sms.Student_Management.entity.Document;
import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.repository.DocumentRepo;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.UserRepo;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepo documentRepo;
    private final StudRepo studRepo;
    private final UserRepo userRepo;

    public DocumentService(DocumentRepo documentRepo, StudRepo studRepo, UserRepo userRepo) {
        this.documentRepo = documentRepo;
        this.studRepo = studRepo;
        this.userRepo = userRepo;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    /**
     * Student uploads a document to their teacher.
     */
    @PreAuthorize("hasRole('STUDENT')")
    public Document uploadDocument(Long studentId, Document document) {
        String username = getCurrentUsername();
        log.info("Uploading document by student: {}", username);

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (!student.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only upload documents for your own account");
        }

        User teacher = student.getTeacher();
        if (teacher == null) {
            throw new RuntimeException("You do not have an assigned teacher");
        }

        document.setStudent(student);
        document.setTeacher(teacher);
        document.setUploadedAt(LocalDateTime.now());

        Document saved = documentRepo.save(document);
        log.info("Document uploaded with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Teacher uploads a document to a student.
     */
    @PreAuthorize("hasRole('TEACHER')")
    public Document uploadDocumentToStudent(Long studentId, Document document) {
        String username = getCurrentUsername();
        log.info("Teacher {} uploading document to student ID: {}", username, studentId);

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        User teacher = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + username));

        if (!student.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only upload documents to your own students");
        }

        document.setStudent(student);
        document.setTeacher(teacher);
        document.setUploadedAt(LocalDateTime.now());

        Document saved = documentRepo.save(document);
        log.info("Document uploaded with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Get all documents for the current student (or specified student by admin).
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public List<Document> getDocumentsForStudent(Long studentId) {
        String username = getCurrentUsername();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTeacher = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        if (!isAdmin && !isTeacher) {
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            if (!student.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You can only view your own documents");
            }
        }

        if (isTeacher) {
            User teacher = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Teacher not found: " + username));
            if (!student.getTeacher().getId().equals(teacher.getId())) {
                throw new RuntimeException("You can only view documents for your own students");
            }
        }

        List<Document> documents = documentRepo.findByStudentOrderByUploadedAtDesc(student);
        log.info("Fetched {} documents for student ID: {}", documents.size(), studentId);
        return documents;
    }

    /**
     * Get all documents uploaded by the current teacher to their students.
     */
    @PreAuthorize("hasRole('TEACHER')")
    public List<Document> getDocumentsUploadedByTeacher() {
        String username = getCurrentUsername();
        log.info("Fetching documents uploaded by teacher: {}", username);

        User teacher = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + username));

        List<Document> documents = documentRepo.findByTeacherOrderByUploadedAtDesc(teacher);
        log.info("Teacher {} has uploaded {} documents", username, documents.size());
        return documents;
    }

    /**
     * Get all documents where the current user is the student.
     */
    @PreAuthorize("hasRole('STUDENT')")
    public List<Document> getMyDocuments() {
        String username = getCurrentUsername();
        log.info("Fetching documents for student: {}", username);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Student student = studRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student not found for user: " + username));

        List<Document> documents = documentRepo.findByStudentOrderByUploadedAtDesc(student);
        log.info("Student {} has {} documents", username, documents.size());
        return documents;
    }

    /**
     * Mark a document as read (student-side).
     */
    @PreAuthorize("hasRole('STUDENT')")
    public Document markAsRead(Long documentId) {
        String username = getCurrentUsername();
        log.info("Marking document ID: {} as read by student: {}", documentId, username);

        Document document = documentRepo.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (!document.getStudent().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only mark your own documents as read");
        }

        document.setIsRead(true);
        return documentRepo.save(document);
    }
}
