package com.sms.Student_Management.config;

import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/** Creates a first Administrator only for a new installation. */
@Component
public class BootstrapAdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdminInitializer.class);

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String username;
    private final String password;
    private final String name;

    public BootstrapAdminInitializer(
            UserRepo userRepo,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.enabled:false}") boolean enabled,
            @Value("${app.bootstrap-admin.username:}") String username,
            @Value("${app.bootstrap-admin.password:}") String password,
            @Value("${app.bootstrap-admin.name:Administrator}") String name) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.username = username;
        this.password = password;
        this.name = name;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled || !userRepo.findByRole("ADMIN").isEmpty()) {
            return;
        }

        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            log.warn("Initial Admin creation is enabled, but username or password is missing.");
            return;
        }

        if (userRepo.findByUsername(username.trim()).isPresent()) {
            log.warn("Initial Admin creation skipped because username '{}' already exists.", username.trim());
            return;
        }

        User admin = new User();
        admin.setUsername(username.trim());
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("ADMIN");
        admin.setName(StringUtils.hasText(name) ? name.trim() : "Administrator");
        userRepo.save(admin);
        log.info("Initial Administrator account created for username '{}'.", admin.getUsername());
    }
}
