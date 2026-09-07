package com.sms.Student_Management.controller;

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

    User user = userService.findByUsernameForLogin(request.getUsername());

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    String token = jwtUtil.generateToken(
            user.getUsername(),
            user.getRole()
    );

    return new LoginResponseDto(
            user.getUsername(),
            user.getRole(),
            token
    );
}
}