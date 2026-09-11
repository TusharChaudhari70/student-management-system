package com.sms.Student_Management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sms.Student_Management.entity.Document;
import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.User;

public interface DocumentRepo extends JpaRepository<Document, Long> {
    List<Document> findByStudentOrderByUploadedAtDesc(Student student);
    List<Document> findByTeacherOrderByUploadedAtDesc(User teacher);
}
