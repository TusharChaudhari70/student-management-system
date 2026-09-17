package com.sms.Student_Management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sms.Student_Management.entity.Subject;

@Repository
public interface SubjectRepo extends JpaRepository<Subject, Long> {
Optional<Subject> findByName(String name);

}
