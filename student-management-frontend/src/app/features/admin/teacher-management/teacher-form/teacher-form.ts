import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Teacher } from '../../../../shared/models/teacher.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-teacher-form',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './teacher-form.html',
  styleUrl: './teacher-form.scss',
})
export class TeacherForm {
  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true }),
  });
  private teacherValue!: Partial<Teacher>;
  @Input({ required: true }) set teacher(value: Partial<Teacher>) {
    this.teacherValue = value;
    this.form.patchValue(value, { emitEvent: false });
  }
  private includePasswordValue = false;
  @Input() set includePassword(value: boolean) {
    this.includePasswordValue = value;
    this.form.controls.password.setValidators(
      value ? [Validators.required, Validators.minLength(6)] : [],
    );
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });
  }
  get includePassword(): boolean {
    return this.includePasswordValue;
  }
  @Input() submitLabel = 'Save Teacher';
  @Input() formName = 'teacherForm';
  @Output() submitted = new EventEmitter<FormGroup>();
  @Output() cancelled = new EventEmitter<FormGroup>();

  constructor() {
    this.form.valueChanges.subscribe((value) => {
      if (this.teacherValue) Object.assign(this.teacherValue, value);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) this.form.markAllAsTouched();
    else this.submitted.emit(this.form);
  }
}
