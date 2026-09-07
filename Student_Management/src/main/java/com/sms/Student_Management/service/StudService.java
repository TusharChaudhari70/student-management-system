package com.sms.Student_Management.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.exception.StudentNotFoundException;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.UserRepo;

@Service
public class StudService {

    private final StudRepo studRepo;
    private final UserRepo userRepo;

    public StudService(
            StudRepo studRepo,
            UserRepo userRepo) {

        this.studRepo = studRepo;
        this.userRepo = userRepo;
    }


    /* =========================
       CREATE STUDENT
    ========================= */

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public Student createStudent(Student student) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String username = authentication.getName();

    boolean isAdmin =
            authentication.getAuthorities()
                    .stream()
                    .anyMatch(
                            a -> a.getAuthority()
                                    .equals("ROLE_ADMIN")
                    );

    boolean isTeacher =
            authentication.getAuthorities()
                    .stream()
                    .anyMatch(
                            a -> a.getAuthority()
                                    .equals("ROLE_TEACHER")
                    );


    // ADMIN
    // Use the teacher selected from the Add Student form
    if (isAdmin) {

        if (student.getTeacher() == null ||
                student.getTeacher().getId() == null) {

            throw new RuntimeException(
                    "Please select a teacher"
            );
        }

        Long teacherId =
                student.getTeacher().getId();

        User teacher =
                userRepo.findById(teacherId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Selected teacher not found"
                                )
                        );


        if (!"TEACHER".equals(teacher.getRole())) {

            throw new RuntimeException(
                    "Selected user is not a TEACHER"
            );
        }

        student.setTeacher(teacher);
    }


    // TEACHER
    // Automatically assign logged-in teacher
   if (isTeacher) {
    User teacher = userRepo.findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException("Teacher not found"));

    student.setTeacher(teacher);
}

if (studRepo.existsByEmail(student.getEmail())) {
    throw new RuntimeException(
        "Student with email " + student.getEmail()
        + " already exists. Please use a different email."
    );
}

return studRepo.save(student);
}

    /* =========================
       GET ALL STUDENTS
    ========================= */

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Student> getAllStudents() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username =
                authentication.getName();


        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                a -> a.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );


        // ADMIN sees all students
        if (isAdmin) {

            return studRepo.findAll();
        }


        // TEACHER sees only assigned students
        return studRepo.findByTeacherUsername(username);
    }


    /* =========================
       GET STUDENT BY ID
    ========================= */

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Student getStudentById(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username =
                authentication.getName();


        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                a -> a.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );


        Student student =
                studRepo.findById(id)
                        .orElseThrow(() ->
                                new StudentNotFoundException(
                                        "Student with ID "
                                                + id
                                                + " does not exist"
                                )
                        );


        // ADMIN can search ANY student
        if (isAdmin) {

            return student;
        }


        // TEACHER can only search
        // their own student
        if (
                student.getTeacher() == null ||
                !student.getTeacher()
                        .getUsername()
                        .equals(username)
        ) {

            throw new RuntimeException(
                    "You are not authorized to access this student"
            );
        }


        return student;
    }


    /* =========================
       UPDATE STUDENT
    ========================= */

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Student updateStudent(
            Long id,
            Student studentDetails) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username =
                authentication.getName();


        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                a -> a.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );


        Student existingStudent =
                studRepo.findById(id)
                        .orElseThrow(() ->
                                new StudentNotFoundException(
                                        "Student with ID "
                                                + id
                                                + " does not exist"
                                )
                        );


        // TEACHER can update only
        // their own student
        if (!isAdmin) {

            if (
                    existingStudent.getTeacher() == null ||
                    !existingStudent
                            .getTeacher()
                            .getUsername()
                            .equals(username)
            ) {

                throw new RuntimeException(
                        "You are not authorized to update this student"
                );
            }
        }


        // Update basic student information
        existingStudent.setName(
                studentDetails.getName()
        );

        existingStudent.setEmail(
                studentDetails.getEmail()
        );

        existingStudent.setCourse(
                studentDetails.getCourse()
        );

        existingStudent.setAge(
                studentDetails.getAge()
        );


        // ADMIN can change teacher
        if (
                isAdmin &&
                studentDetails.getTeacher() != null
        ) {

            String teacherUsername =
                    studentDetails
                            .getTeacher()
                            .getUsername();


            User teacher =
                    userRepo.findByUsername(
                            teacherUsername
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Teacher not found"
                            )
                    );


            if (
                    !"TEACHER".equals(
                            teacher.getRole()
                    )
            ) {

                throw new RuntimeException(
                        "Selected user is not a TEACHER"
                );
            }


            existingStudent.setTeacher(teacher);
        }


        return studRepo.save(
                existingStudent
        );
    }


    /* =========================
       DELETE STUDENT
    ========================= */

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Long deleteStudent(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String username =
                authentication.getName();


        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                a -> a.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );


        Student existingStudent =
                studRepo.findById(id)
                        .orElseThrow(() ->
                                new StudentNotFoundException(
                                        "Student with ID "
                                                + id
                                                + " does not exist"
                                )
                        );


        // TEACHER can delete only
        // their own student
        if (!isAdmin) {

            if (
                    existingStudent.getTeacher() == null ||
                    !existingStudent
                            .getTeacher()
                            .getUsername()
                            .equals(username)
            ) {

                throw new RuntimeException(
                        "You are not authorized to delete this student"
                );
            }
        }


        studRepo.delete(existingStudent);

        return id;
    }


    /* =========================
       ADD MULTIPLE STUDENTS
    ========================= */

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Student> createStudents(
            List<Student> students) {

        return studRepo.saveAll(students);
    }
}