package com.sms.Student_Management.config;

import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.entity.User;
import com.sms.Student_Management.repository.StudRepo;
import com.sms.Student_Management.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Adds predictable demo accounts for local Docker development only. */
@Component
public class DemoDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final UserRepo userRepo;
    private final StudRepo studRepo;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String password;

    public DemoDataInitializer(
            UserRepo userRepo,
            StudRepo studRepo,
            PasswordEncoder passwordEncoder,
            @Value("${app.demo-data.enabled:false}") boolean enabled,
            @Value("${app.demo-data.password:}") String password) {
        this.userRepo = userRepo;
        this.studRepo = studRepo;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        if (password == null || password.isBlank()) {
            log.warn("Demo data is enabled but DEMO_DATA_PASSWORD is missing; no demo accounts were created.");
            return;
        }

        User teacherOne = createTeacherIfMissing("teacher1", "Anita Sharma", "teacher1@example.test");
        User teacherTwo = createTeacherIfMissing("teacher2", "Rahul Verma", "teacher2@example.test");
        createStudentIfMissing("student1", "Priya Patel", "student1@example.test", "BCA", 20, teacherOne);
        createStudentIfMissing("student2", "Arjun Singh", "student2@example.test", "BSc Computer Science", 21, teacherTwo);
    }

    private User createTeacherIfMissing(String username, String name, String email) {
        return userRepo.findByUsername(username).orElseGet(() -> {
            User teacher = new User();
            teacher.setUsername(username);
            teacher.setPassword(passwordEncoder.encode(password));
            teacher.setRole("TEACHER");
            teacher.setName(name);
            teacher.setEmail(email);
            User savedTeacher = userRepo.save(teacher);
            log.info("Demo teacher account created for username '{}'.", username);
            return savedTeacher;
        });
    }

    private void createStudentIfMissing(String username, String name, String email, String course, int age, User teacher) {
        if (userRepo.findByUsername(username).isPresent() || studRepo.existsByEmail(email)) {
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("STUDENT");
        user.setName(name);
        user.setEmail(email);

        Student student = new Student();
        student.setName(name);
        student.setEmail(email);
        student.setCourse(course);
        student.setAge(age);
        student.setTeacher(teacher);
        student.setUser(userRepo.save(user));
        studRepo.save(student);
        log.info("Demo student account created for username '{}'.", username);
    }
}
