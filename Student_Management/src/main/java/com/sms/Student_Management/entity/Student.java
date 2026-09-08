package com.sms.Student_Management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String course;

    private Integer age;

    // ================================
    // ASSIGNED TEACHER
    // ================================

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    // ================================
    // STUDENT LOGIN USER
    // ================================

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}