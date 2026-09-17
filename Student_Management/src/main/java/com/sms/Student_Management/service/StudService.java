package com.sms.Student_Management.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.Subject;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.exception.StudentNotFoundException;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.SubjectRepo;
import com.sms.Student_Management.repository.UserRepo;

@Service
public class StudService {

private static final Logger log =
        LoggerFactory.getLogger(StudService.class);

private final StudRepo studRepo;
private final UserRepo userRepo;
private final SubjectRepo subjectRepo;
private final PasswordEncoder passwordEncoder;

public StudService(
        StudRepo studRepo,
        UserRepo userRepo,
        SubjectRepo subjectRepo,
        PasswordEncoder passwordEncoder) {

    this.studRepo = studRepo;
    this.userRepo = userRepo;
    this.subjectRepo = subjectRepo;
    this.passwordEncoder = passwordEncoder;
}

@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@Transactional
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

    if (isAdmin) {

        if (student.getTeacher() == null ||
                student.getTeacher().getId() == null) {

            throw new RuntimeException("Please select a teacher");
        }

        Long teacherId = student.getTeacher().getId();

        User teacher = userRepo.findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Selected teacher not found"));

        if (!"TEACHER".equals(teacher.getRole())) {
            throw new RuntimeException(
                    "Selected user is not a TEACHER");
        }

        student.setTeacher(teacher);
    }

    if (isTeacher) {

        User teacher = userRepo.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Teacher not found"));

        student.setTeacher(teacher);
    }

    if (student.getEmail() == null ||
            student.getEmail().trim().isEmpty()) {

        throw new RuntimeException("Student email is required");
    }

    student.setEmail(student.getEmail().trim());

    if (studRepo.existsByEmail(student.getEmail())) {

        throw new RuntimeException(
                "Student with email " + student.getEmail()
                        + " already exists. Please use a different email.");
    }

    if (student.getIsDeleted() == null) {
        student.setIsDeleted(false);
    }

    String loginUsername = student.getUsername() == null
            ? null
            : student.getUsername().trim();

    String loginPassword = student.getPassword();

    if (loginUsername == null || loginUsername.isEmpty()) {
        throw new RuntimeException(
                "Username is required for the student login account");
    }

    if (loginPassword == null || loginPassword.trim().isEmpty()) {
        throw new RuntimeException(
                "Password is required for the student login account");
    }

    if (userRepo.findByUsername(loginUsername).isPresent()) {
        throw new RuntimeException(
                "Username " + loginUsername
                        + " is already taken. Please choose another username.");
    }

    if (userRepo.findByEmail(student.getEmail()).isPresent()) {
        throw new RuntimeException(
                "A login account already exists for email: "
                        + student.getEmail());
    }

    Set<Subject> selectedSubjects =
            resolveSubjects(student.getSubjects());

    student.setSubjects(selectedSubjects);

    student.setCourse(joinSubjectNames(selectedSubjects));

    User studentUser = new User();

    studentUser.setUsername(loginUsername);
    studentUser.setPassword(
            passwordEncoder.encode(loginPassword));
    studentUser.setRole("STUDENT");
    studentUser.setName(student.getName());
    studentUser.setEmail(student.getEmail());

    User savedUser = userRepo.save(studentUser);

    student.setUser(savedUser);

    Student savedStudent = studRepo.save(student);

    log.info(
            "Student created successfully with ID: {}",
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

    if (isAdmin) {

        List<Student> students = studRepo.findAll();

        log.info(
                "Admin fetched {} students",
                students.size());

        return students;
    }

    List<Student> students =
            studRepo.findByTeacherUsername(username);

    log.info(
            "Teacher {} fetched {} students",
            username,
            students.size());

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

    Student student = studRepo.findById(id)
            .orElseThrow(() ->
                    new StudentNotFoundException(
                            "Student with ID " + id
                                    + " does not exist"));

    if (isAdmin) {
        return student;
    }

    if (student.getTeacher() == null ||
            !student.getTeacher()
                    .getUsername()
                    .equals(username)) {

        throw new RuntimeException(
                "You are not authorized to access this student");
    }

    return student;
}

@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@Transactional
public Student updateStudent(
        Long id,
        Student studentDetails) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String username = authentication.getName();

    boolean isAdmin = authentication.getAuthorities()
            .stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

    Student existingStudent = studRepo.findById(id)
            .orElseThrow(() ->
                    new StudentNotFoundException(
                            "Student with ID " + id
                                    + " does not exist"));

    if (!isAdmin) {

        if (existingStudent.getTeacher() == null ||
                !existingStudent.getTeacher()
                        .getUsername()
                        .equals(username)) {

            throw new RuntimeException(
                    "You are not authorized to update this student");
        }
    }

    existingStudent.setName(studentDetails.getName());
    existingStudent.setEmail(studentDetails.getEmail());
    existingStudent.setAge(studentDetails.getAge());

    if (studentDetails.getSubjects() != null &&
            !studentDetails.getSubjects().isEmpty()) {

        Set<Subject> selectedSubjects =
                resolveSubjects(studentDetails.getSubjects());

        existingStudent.setSubjects(selectedSubjects);

        existingStudent.setCourse(
                joinSubjectNames(selectedSubjects));

    } else if (studentDetails.getCourse() != null) {

        existingStudent.setCourse(
                studentDetails.getCourse());
    }

    User loginUser = existingStudent.getUser();

    if (loginUser == null) {
        String usernameForNewAccount = studentDetails.getUsername() == null ? "" : studentDetails.getUsername().trim();
        String passwordForNewAccount = studentDetails.getPassword() == null ? "" : studentDetails.getPassword().trim();
        if (!usernameForNewAccount.isEmpty() || !passwordForNewAccount.isEmpty()) {
            if (usernameForNewAccount.isEmpty() || passwordForNewAccount.isEmpty()) {
                throw new RuntimeException("Enter both username and password to create this student's login account");
            }
            if (userRepo.findByUsername(usernameForNewAccount).isPresent()) {
                throw new RuntimeException("Username " + usernameForNewAccount + " is already taken. Please choose another username.");
            }
            loginUser = new User();
            loginUser.setUsername(usernameForNewAccount);
            loginUser.setPassword(passwordEncoder.encode(passwordForNewAccount));
            loginUser.setRole("STUDENT");
            loginUser.setName(existingStudent.getName());
            loginUser.setEmail(existingStudent.getEmail());
            existingStudent.setUser(userRepo.save(loginUser));
        }
    } else {

        String newUsername = studentDetails.getUsername() == null
                ? null
                : studentDetails.getUsername().trim();

        if (newUsername != null &&
                !newUsername.isEmpty() &&
                !newUsername.equals(loginUser.getUsername())) {

            if (userRepo.findByUsername(newUsername).isPresent()) {

                throw new RuntimeException(
                        "Username " + newUsername
                                + " is already taken. Please choose another username.");
            }

            loginUser.setUsername(newUsername);
        }

        if (studentDetails.getPassword() != null &&
                !studentDetails.getPassword()
                        .trim()
                        .isEmpty()) {

            loginUser.setPassword(
                    passwordEncoder.encode(
                            studentDetails.getPassword()));
        }

        loginUser.setName(existingStudent.getName());
        loginUser.setEmail(existingStudent.getEmail());

        userRepo.save(loginUser);
    }

    if (isAdmin) {

        if (studentDetails.getTeacher() == null ||
                studentDetails.getTeacher().getId() == null) {

            throw new RuntimeException(
                    "Please select a teacher");
        }

        Long teacherId =
                studentDetails.getTeacher().getId();

        User teacher = userRepo.findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Selected teacher not found"));

        if (!"TEACHER".equals(teacher.getRole())) {

            throw new RuntimeException(
                    "Selected user is not a TEACHER");
        }

        existingStudent.setTeacher(teacher);
    }

    Student updatedStudent =
            studRepo.save(existingStudent);

    log.info(
            "Student ID: {} updated successfully",
            id);

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

    Student existingStudent = studRepo.findById(id)
            .orElseThrow(() ->
                    new StudentNotFoundException(
                            "Student with ID " + id
                                    + " does not exist"));

    if (!isAdmin) {

        if (existingStudent.getTeacher() == null ||
                !existingStudent.getTeacher()
                        .getUsername()
                        .equals(username)) {

            throw new RuntimeException(
                    "You are not authorized to delete this student");
        }
    }

    existingStudent.setIsDeleted(true);

    studRepo.save(existingStudent);

    return id;
}

@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public List<Student> createStudents(List<Student> students) {

    students.forEach(student -> {

        if (student.getIsDeleted() == null) {
            student.setIsDeleted(false);
        }

        if (student.getSubjects() != null &&
                !student.getSubjects().isEmpty()) {

            Set<Subject> subjects =
                    resolveSubjects(student.getSubjects());

            student.setSubjects(subjects);

            student.setCourse(
                    joinSubjectNames(subjects));
        }
    });

    return studRepo.saveAll(students);
}

@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
public Student getStudentProfileByUsername(String username) {

    User user = userRepo.findByUsername(username)
            .orElseThrow(() ->
                    new RuntimeException(
                            "User not found with username: "
                                    + username));

    Student student = studRepo.findByUserId(user.getId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Student profile not found for user: "
                                    + username));

    Authentication authentication =
            SecurityContextHolder.getContext()
                    .getAuthentication();

    boolean isAdmin = authentication.getAuthorities()
            .stream()
            .anyMatch(a -> a.getAuthority()
                    .equals("ROLE_ADMIN"));

    boolean isTeacher = authentication.getAuthorities()
            .stream()
            .anyMatch(a -> a.getAuthority()
                    .equals("ROLE_TEACHER"));

    if (!isAdmin && !isTeacher) {

        if (!student.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You can only view your own profile");
        }
    }

    return student;
}

private Set<Subject> resolveSubjects(
        Set<Subject> requestedSubjects) {

    if (requestedSubjects == null ||
            requestedSubjects.isEmpty()) {

        throw new RuntimeException(
                "Please select at least one subject");
    }

    Set<Subject> resolved =
            new HashSet<>();

    for (Subject requestedSubject :
            requestedSubjects) {

        if (requestedSubject == null ||
                requestedSubject.getId() == null) {

            continue;
        }

        Subject subject =
                subjectRepo.findById(
                        requestedSubject.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Selected subject does not exist"));

        resolved.add(subject);
    }

    if (resolved.isEmpty()) {

        throw new RuntimeException(
                "Please select at least one valid subject");
    }

    return resolved;
}

private String joinSubjectNames(
        Set<Subject> subjects) {

    return subjects.stream()
            .map(Subject::getName)
            .filter(name -> name != null)
            .sorted()
            .collect(Collectors.joining(", "));
}

}
