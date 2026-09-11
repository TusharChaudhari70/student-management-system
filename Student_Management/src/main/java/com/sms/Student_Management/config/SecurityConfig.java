package com.sms.Student_Management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sms.Student_Management.security.JwtAuthFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .authorizeHttpRequests(auth -> auth

                // LOGIN MUST BE PUBLIC
                .requestMatchers(
                    "/auth/login",
                    "/auth/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()

                // USER PROFILE API (ADMIN, TEACHER, STUDENT)
                .requestMatchers("/users/profile").hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                // USER STUDENT APIs (ADMIN, TEACHER)
                .requestMatchers("/users/students/**").hasAnyRole("ADMIN", "TEACHER")

                // USER APIs ADMIN ONLY (remaining /users/**)
                .requestMatchers("/users/**")
                .hasRole("ADMIN")

                // STUDENT APIs - accessible by STUDENT role
                .requestMatchers("/students/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                // DOCUMENT APIs - accessible by ADMIN, TEACHER, STUDENT
                .requestMatchers("/documents/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                // TASK APIs - accessible by ADMIN, TEACHER, STUDENT
                .requestMatchers("/tasks/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                // ALL OTHER ENDPOINTS
                .anyRequest()
                .authenticated()
            )

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}