package com.sms.Student_Management.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sms.Student_Management.entity.Message;
import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.repository.MessageRepo;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.UserRepo;

@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private final MessageRepo messageRepo;
    private final StudRepo studRepo;
    private final UserRepo userRepo;

    public MessageService(MessageRepo messageRepo, StudRepo studRepo, UserRepo userRepo) {
        this.messageRepo = messageRepo;
        this.studRepo = studRepo;
        this.userRepo = userRepo;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Message sendMessageToStudent(Long studentId, Message message) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found with username: " + username));

        Student student = studRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        if (teacher.getRole().equals("TEACHER") && (student.getTeacher() == null || !student.getTeacher().getId().equals(teacher.getId()))) {
            throw new RuntimeException("You can only send announcements to your own students");
        }

        message.setTeacher(teacher);
        message.setStudent(student);
        message.setSentAt(LocalDateTime.now());
        message.setIsRead(false);

        log.info("Teacher {} sending message to student ID: {}", username, studentId);
        return messageRepo.save(message);
    }

    @PreAuthorize("hasRole('TEACHER')")
    public List<Message> sendMessageToStudents(List<Long> studentIds, Message message) {
        if (studentIds == null || studentIds.isEmpty()) {
            throw new RuntimeException("Select at least one student");
        }
        return studentIds.stream().map(studentId -> {
            Message copy = new Message();
            copy.setMessage(message.getMessage());
            copy.setFileName(message.getFileName());
            copy.setFileUrl(message.getFileUrl());
            return sendMessageToStudent(studentId, copy);
        }).toList();
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'TEACHER')")
    public List<Message> getMyMessages() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Student student = studRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + username));

        log.info("Fetching messages for student: {}", username);
        return messageRepo.findByStudentIdOrderBySentAtDesc(student.getId());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Message> getMessagesSentByTeacher() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching messages sent by teacher: {}", username);
        return messageRepo.findByTeacherUsernameOrderBySentAtDesc(username);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public Message markAsRead(Long messageId) {
        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
        message.setIsRead(true);
        return messageRepo.save(message);
    }
}
