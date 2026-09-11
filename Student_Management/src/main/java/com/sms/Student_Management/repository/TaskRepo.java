package com.sms.Student_Management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sms.Student_Management.entity.Task;
import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.User;

public interface TaskRepo extends JpaRepository<Task, Long> {
    List<Task> findByStudentOrderByCreatedAtDesc(Student student);
    List<Task> findByTeacherOrderByCreatedAtDesc(User teacher);
}
