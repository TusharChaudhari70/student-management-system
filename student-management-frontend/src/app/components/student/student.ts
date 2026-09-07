import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student',
  imports: [FormsModule],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class StudentComponent {

  student = {
    name: '',
    email: '',
    course: '',
    age: null as number | null
  };

  constructor(private studentService: StudentService) {}

  addStudent() {

    if (
      !this.student.name ||
      !this.student.email ||
      !this.student.course ||
      this.student.age === null
    ) {
      alert('Please fill all required fields.');
      return;
    }

    if (this.student.age <= 0) {
      alert('Age must be greater than 0.');
      return;
    }

    this.studentService.addStudent({
      name: this.student.name,
      email: this.student.email,
      course: this.student.course,
      age: this.student.age
    }).subscribe({

      next: () => {

        alert('Student added successfully');

        this.clearForm();

      },

      error: (error) => {

        console.error('Error adding student:', error);

        alert('Failed to add student.');

      }

    });
  }

  clearForm() {

    this.student = {
      name: '',
      email: '',
      course: '',
      age: null
    };

  }

}