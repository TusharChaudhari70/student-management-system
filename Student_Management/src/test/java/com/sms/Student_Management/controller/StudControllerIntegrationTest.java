// package com.sms.Student_Management.controller;

// import static org.junit.jupiter.api.Assertions.assertNotNull;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.web.server.LocalServerPort;
// import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
// import org.springframework.web.client.RestTemplate;

// import com.sms.Student_Management.entity.Student;
// @AutoConfigureMockMvc(addFilters = false)
// @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// class StudControllerIntegrationTest {

//     @LocalServerPort
//     private int port;

//     private RestTemplate restTemplate;

//     @BeforeEach
//     void setUp() {
//         restTemplate = new RestTemplate();
//     }

//     @Test
//     void getStudentById() {

//         Student result = restTemplate.getForObject(
//                 "http://localhost:" + port + "/students/1",
//                 Student.class
//         );

//         assertNotNull(result);
//     }
// }