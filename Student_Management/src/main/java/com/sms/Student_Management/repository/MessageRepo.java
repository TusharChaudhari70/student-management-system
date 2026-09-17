package com.sms.Student_Management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sms.Student_Management.entity.Message;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {

    List<Message> findByStudentIdOrderBySentAtDesc(Long studentId); // Find all messages for student

    List<Message> findByTeacherUsernameOrderBySentAtDesc(String username); // Find messages sent by teacher

    long countByStudentIdAndIsReadFalse(Long studentId); // Count unread messages for student
}

