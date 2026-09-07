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
public User findByUsernameForLogin(String username) {
    return userRepo.findByUsername(username)
            .orElseThrow(() ->
                new RuntimeException("User not found with username: " + username)
            );
}
    
}