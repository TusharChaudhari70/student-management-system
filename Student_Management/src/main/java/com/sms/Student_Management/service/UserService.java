package com.sms.Student_Management.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.UserRepo;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final StudRepo studRepo;

   public UserService(UserRepo userRepo,
                   PasswordEncoder passwordEncoder,
                   StudRepo studRepo) {
    this.userRepo = userRepo;
    this.passwordEncoder = passwordEncoder;
    this.studRepo = studRepo;
}
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(User user) {

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepo.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User getUserById(Long id) {
        return userRepo.findById(id)
                   .orElse(null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User getUserByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found with username: " + username)
                );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public User getProfile(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException("User not found with username: " + username)
                );

        User profile = new User();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setRole(user.getRole());
        profile.setPassword(null);

        return profile;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User updateUser(Long id, User userDetails) {

        User existingUser = userRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("User not found with id: " + id)
                );

        existingUser.setUsername(userDetails.getUsername());
        existingUser.setName(userDetails.getName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setRole(userDetails.getRole());

        return userRepo.save(existingUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
   public Long deleteUser(Long id) {

    User existingUser = userRepo.findById(id)
            .orElseThrow(() ->
                new RuntimeException("User not found with id: " + id)
            );

    if ("TEACHER".equals(existingUser.getRole())) {

        long studentCount = studRepo.countByTeacherId(id);

        if (studentCount > 0) {
            throw new RuntimeException(
                    "Cannot delete teacher. Teacher has assigned students."
            );
        }
    }

    userRepo.delete(existingUser);

    return id;
}
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllTeachers() {
        return userRepo.findByRole("TEACHER");
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User createStudent(User user) {
        user.setRole("STUDENT");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public User getStudentById(Long id) {
        User student = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        if (!"STUDENT".equals(student.getRole())) {
            throw new RuntimeException("User with id " + id + " is not a student");
        }

        return student;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<User> getAllStudents() {
        return userRepo.findByRole("STUDENT");
    }

    @PreAuthorize("hasRole('ADMIN')")
    public User updateStudent(Long id, User studentDetails) {
        User existingStudent = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        if (!"STUDENT".equals(existingStudent.getRole())) {
            throw new RuntimeException("User with id " + id + " is not a student");
        }

        existingStudent.setUsername(studentDetails.getUsername());
        existingStudent.setName(studentDetails.getName());
        existingStudent.setEmail(studentDetails.getEmail());

        return userRepo.save(existingStudent);
    }
public User findByUsernameForLogin(String username) {
    return userRepo.findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("User not found with username: " + username)
            );
}
    
@PreAuthorize("hasRole('ADMIN')")
public User createTeacher(User user) {

    user.setRole("TEACHER");

    user.setPassword(
        passwordEncoder.encode(user.getPassword())
    );

    return userRepo.save(user);
}

@PreAuthorize("hasRole('ADMIN')")
public User updateTeacher(Long id, User teacherDetails) {

    User existingTeacher = userRepo.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "Teacher not found with id: " + id
                )
            );

    if (!"TEACHER".equals(existingTeacher.getRole())) {
        throw new RuntimeException(
            "User with id " + id + " is not a teacher"
        );
    }

    existingTeacher.setUsername(teacherDetails.getUsername());
    existingTeacher.setName(teacherDetails.getName());
    existingTeacher.setEmail(teacherDetails.getEmail());

    // IMPORTANT:
    // Do not take role from frontend.
    // Teacher remains TEACHER.
    existingTeacher.setRole("TEACHER");

    // Password is intentionally not changed here.

    return userRepo.save(existingTeacher);
}

@PreAuthorize("hasRole('ADMIN')")
public User getTeacherById(Long id) {

    User teacher = userRepo.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "Teacher not found with id: " + id
                )
            );

    if (!"TEACHER".equals(teacher.getRole())) {
        throw new RuntimeException(
            "User with id " + id + " is not a teacher"
        );
    }

    return teacher;
}
}