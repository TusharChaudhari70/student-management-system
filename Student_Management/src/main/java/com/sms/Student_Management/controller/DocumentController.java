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
import org.springframework.web.bind.annotation.RestController;

import com.sms.Student_Management.entity.Document;
import com.sms.Student_Management.service.DocumentService;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Student uploads a document (e.g. case study submission) to their teacher.
     */
    @PostMapping("/upload")
    public Document uploadDocument(@RequestBody Document document) {
        log.info("Document upload request received");
        return documentService.uploadDocument(document.getStudent().getId(), document);
    }

    /**
     * Teacher uploads a document to a specific student.
     */
    @PostMapping("/{studentId}/upload")
    public Document uploadDocumentToStudent(
            @PathVariable Long studentId,
            @RequestBody Document document) {
        log.info("Teacher uploading document to student ID: {}", studentId);
        return documentService.uploadDocumentToStudent(studentId, document);
    }

    /**
     * Get all documents uploaded by the current teacher to their students.
     */
    @GetMapping("/teacher")
    public List<Document> getDocumentsUploadedByTeacher() {
        log.info("Fetching documents uploaded by current teacher");
        return documentService.getDocumentsUploadedByTeacher();
    }

    /**
     * Get all documents for a given student (admin/teacher) or self (student).
     */
    @GetMapping("/student/{studentId}")
    public List<Document> getDocumentsForStudent(@PathVariable Long studentId) {
        log.info("Fetching documents for student ID: {}", studentId);
        return documentService.getDocumentsForStudent(studentId);
    }

    /**
     * Get all documents for the current student.
     */
    @GetMapping("/my-documents")
    public List<Document> getMyDocuments() {
        log.info("Fetching documents for current student");
        return documentService.getMyDocuments();
    }

    /**
     * Mark a document as read.
     */
    @PutMapping("/{documentId}/read")
    public Document markAsRead(@PathVariable Long documentId) {
        log.info("Marking document ID: {} as read", documentId);
        return documentService.markAsRead(documentId);
    }
}
