package com.sms.Student_Management.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.Student_Management.dto.LoginRequestDto;
import com.sms.Student_Management.dto.LoginResponseDto;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.security.JwtUtil;
import com.sms.Student_Management.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log =
            LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto request) {

        log.info("Login attempt for username: {}", request.getUsername());

        User user = userService.findByUsernameForLogin(
                request.getUsername());

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            log.warn("Invalid password for username: {}",
                    request.getUsername());

            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole()
        );

        log.info("Login successful for username: {}, role: {}",
                user.getUsername(),
                user.getRole());

        return new LoginResponseDto(
                user.getUsername(),
                user.getRole(),
                token
        );
    }
}