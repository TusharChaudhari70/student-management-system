package com.sms.Student_Management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sms.Student_Management.entity.Student;
public interface StudRepo extends JpaRepository<Student, Long>  {
    List<Student> findByTeacherUsername(String username);
    long countByTeacherId(Long teacherId);
    boolean existsByEmail(String email);
    java.util.Optional<Student> findByUserId(Long userId);
}
