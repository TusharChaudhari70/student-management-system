package com.sms.Student_Management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sms.Student_Management.entity.StoredFile;

public interface StoredFileRepo extends JpaRepository<StoredFile, String> {
}
