package com.sms.Student_Management.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log =
            LoggerFactory.getLogger(StudService.class);

    private final StudRepo studRepo;
    private final UserRepo userRepo;

    public StudService(StudRepo studRepo, UserRepo userRepo) {
        this.studRepo = studRepo;
        this.userRepo = userRepo;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Student createStudent(Student student) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isTeacher = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        log.info("Creating student by user: {}", username);

        // ADMIN selects the teacher from the Add Student form
        if (isAdmin) {

            if (student.getTeacher() == null ||
                    student.getTeacher().getId() == null) {

                throw new RuntimeException("Please select a teacher");
            }

            Long teacherId = student.getTeacher().getId();

            User teacher = userRepo.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException("Selected teacher not found"));

            if (!"TEACHER".equals(teacher.getRole())) {
                throw new RuntimeException("Selected user is not a TEACHER");
            }

            student.setTeacher(teacher);

            log.info("Admin assigned teacher ID: {}", teacherId);
        }

        // TEACHER is automatically assigned as the student's teacher
        if (isTeacher) {

            User teacher = userRepo.findByUsername(username)
                    .orElseThrow(() ->
                            new RuntimeException("Teacher not found"));

            student.setTeacher(teacher);

            log.info("Student assigned to teacher: {}", username);
        }

        if (studRepo.existsByEmail(student.getEmail())) {

            log.warn("Student creation failed. Email already exists: {}",
                    student.getEmail());

            throw new RuntimeException(
                    "Student with email " + student.getEmail()
                            + " already exists. Please use a different email.");
        }

        Student savedStudent = studRepo.save(student);

        log.info("Student created successfully with ID: {}",
                savedStudent.getId());

        return savedStudent;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Student> getAllStudents() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        log.info("Fetching students for user: {}", username);

        // ADMIN sees all students
        if (isAdmin) {

            List<Student> students = studRepo.findAll();

            log.info("Admin fetched {} students", students.size());

            return students;
        }

        // TEACHER sees only assigned students
        List<Student> students =
                studRepo.findByTeacherUsername(username);

        log.info("Teacher {} fetched {} students",
                username, students.size());

        return students;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Student getStudentById(Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        log.info("Fetching student ID: {} by user: {}", id, username);

        Student student = studRepo.findById(id)
                .orElseThrow(() ->
                        new StudentNotFoundException(
                                "Student with ID " + id + " does not exist"));

        // ADMIN can access any student
        if (isAdmin) {
            return student;
        }

        // TEACHER can access only their own student
        if (student.getTeacher() == null ||
                !student.getTeacher().getUsername().equals(username)) {

            log.warn("Unauthorized access attempt for student ID: {} by user: {}",
                    id, username);

            throw new RuntimeException(
                    "You are not authorized to access this student");
        }

        return student;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Student updateStudent(
            Long id,
            Student studentDetails) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        log.info("Updating student ID: {} by user: {}", id, username);

        Student existingStudent = studRepo.findById(id)
                .orElseThrow(() ->
                        new StudentNotFoundException(
                                "Student with ID " + id + " does not exist"));

        // Teacher can update only their own student
        if (!isAdmin) {

            if (existingStudent.getTeacher() == null ||
                    !existingStudent.getTeacher()
                            .getUsername()
                            .equals(username)) {

                log.warn(
                        "Unauthorized update attempt for student ID: {} by user: {}",
                        id, username);

                throw new RuntimeException(
                        "You are not authorized to update this student");
            }
        }

        existingStudent.setName(studentDetails.getName());
        existingStudent.setEmail(studentDetails.getEmail());
        existingStudent.setCourse(studentDetails.getCourse());
        existingStudent.setAge(studentDetails.getAge());

        // ADMIN can change the assigned teacher
        if (isAdmin) {

            if (studentDetails.getTeacher() == null ||
                    studentDetails.getTeacher().getId() == null) {

                throw new RuntimeException("Please select a teacher");
            }

            Long teacherId = studentDetails.getTeacher().getId();

            User teacher = userRepo.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException("Selected teacher not found"));

            if (!"TEACHER".equals(teacher.getRole())) {
                throw new RuntimeException(
                        "Selected user is not a TEACHER");
            }

            existingStudent.setTeacher(teacher);

            log.info("Student ID: {} reassigned to teacher ID: {}",
                    id, teacherId);
        }

        Student updatedStudent = studRepo.save(existingStudent);

        log.info("Student ID: {} updated successfully", id);

        return updatedStudent;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public Long deleteStudent(Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        log.info("Deleting student ID: {} by user: {}", id, username);

        Student existingStudent = studRepo.findById(id)
                .orElseThrow(() ->
                        new StudentNotFoundException(
                                "Student with ID " + id + " does not exist"));

        // Teacher can delete only their own student
        if (!isAdmin) {

            if (existingStudent.getTeacher() == null ||
                    !existingStudent.getTeacher()
                            .getUsername()
                            .equals(username)) {

                log.warn(
                        "Unauthorized delete attempt for student ID: {} by user: {}",
                        id, username);

                throw new RuntimeException(
                        "You are not authorized to delete this student");
            }
        }

        studRepo.delete(existingStudent);

        log.info("Student ID: {} deleted successfully", id);

        return id;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<Student> createStudents(List<Student> students) {

        log.info("Creating {} students", students.size());

        List<Student> savedStudents = studRepo.saveAll(students);

        log.info("{} students created successfully",
                savedStudents.size());

        return savedStudents;
    }
}