package com.sms.Student_Management.controller;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.sms.Student_Management.entity.Student;
import com.sms.Student_Management.service.StudService;

class StudControllerTest {

    @Mock
    private StudService studService;
    private StudController studController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        studController = new StudController(studService);
    }
    @Test
    void testGetAllStudents() {
    List<Student> students = List.of(
        new Student(),
        new Student()
    );
    when(studService.getAllStudents()).thenReturn(students);

    List<Student> result = studController.getAllStudents();

    assertEquals(2, result.size());
    verify(studService).getAllStudents();
}
@Test
void getStudentById() {

    Long id = 1L;
    Student student = new Student();
    when(studService.getStudentById(id)).thenReturn(student);
    Student result = studController.getStudentById(id);
    
    assertEquals(student, result);
    verify(studService).getStudentById(id);
}
@Test
void deleteStudent() {

    Long id = 1L;

    when(studService.deleteStudent(id)).thenReturn(id);
    Long result = studController.deleteStudent(id);
    assertEquals(id, result);
    verify(studService).deleteStudent(id);
}
@Test
void createStudent() {
    Student student = new Student();

    when(studService.createStudent(student)).thenReturn(student);
    Student result = studController.createStudent(student);

    assertNotNull(result);
    assertEquals(student, result);

    verify(studService, times(1)).createStudent(student);
}

@Test
void updateStudent() {

    Long id = 1L;

    Student studentDetails = new Student();
    Student updatedStudent = new Student();

    when(studService.updateStudent(id, studentDetails))
            .thenReturn(updatedStudent);

    Student result = studController.updateStudent(id, studentDetails);
    assertNotNull(result);
    assertEquals(updatedStudent, result);

    verify(studService, times(1))
            .updateStudent(id, studentDetails);
}
}