import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Teacher } from '../../models/teacher.model';
import { Subject } from '../../models/subject.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select, SelectModule } from 'primeng/select';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

export interface StudentFormValue {
  name: string;
  email: string;
  course: string;
  age: number | null;
  username?: string;
  password?: string;
  subjects?: Subject[];
}

@Component({
  selector: 'app-student-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
  ],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentForm {
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    course: new FormControl('', { nonNullable: true }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    teacherId: new FormControl<number | null>(null),
    subjectIds: new FormControl<number[]>([], {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  @ViewChild('subjectsSelector') private subjectsSelector?: MultiSelect;
  @ViewChild('subjectsSelector', { read: ElementRef })
  private subjectsSelectorElement?: ElementRef<HTMLElement>;
  @ViewChild('teacherSelector') private teacherSelector?: Select;
  @ViewChild('teacherSelector', { read: ElementRef })
  private teacherSelectorElement?: ElementRef<HTMLElement>;
  private studentValue!: StudentFormValue;
  @Input({ required: true }) set student(value: StudentFormValue) {
    this.studentValue = value;
    this.form.patchValue({ ...value, age: value.age ?? null }, { emitEvent: false });
  }
  @Input() teachers: Teacher[] = [];
  @Input() set teacherId(value: number | null) {
    this.form.controls.teacherId.setValue(value, { emitEvent: false });
  }
  private showTeacherValue = false;
  @Input() set showTeacher(value: boolean) {
    this.showTeacherValue = value;
    this.form.controls.teacherId.setValidators(value ? [Validators.required] : []);
    this.form.controls.teacherId.updateValueAndValidity({ emitEvent: false });
  }
  get showTeacher(): boolean {
    return this.showTeacherValue;
  }
  @Input() loadingTeachers = false;
  @Input() subjects: Subject[] = [];
  @Input() set subjectIds(value: number[]) {
    this.form.controls.subjectIds.setValue(value || [], { emitEvent: false });
  }
  @Input() loadingSubjects = false;
  @Input() submitLabel = 'Save Student';
  private passwordIsRequired = true;
  @Input() set passwordRequired(value: boolean) {
    this.passwordIsRequired = value;
    const validators = value
      ? [Validators.required, Validators.minLength(6)]
      : [Validators.minLength(6)];
    this.form.controls.password.setValidators(validators);
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });
  }
  get passwordRequired(): boolean {
    return this.passwordIsRequired;
  }
  @Input() submitting = false;
  @Input() formName = 'studentForm';
  @Output() teacherIdChange = new EventEmitter<number | null>();
  @Output() subjectIdsChange = new EventEmitter<number[]>();
  @Output() submitted = new EventEmitter<FormGroup>();
  @Output() cancelled = new EventEmitter<FormGroup>();

  constructor() {
    this.form.valueChanges.subscribe((value) => {
      if (this.studentValue) Object.assign(this.studentValue, value);
    });
  }

  onSubjectsChanged(subjectIds: number[]): void {
    this.subjectIdsChange.emit(subjectIds);
  }

  onSubmit(): void {
    if (this.form.invalid) this.form.markAllAsTouched();
    else this.submitted.emit(this.form);
  }

  @HostListener('document:mousedown', ['$event'])
  closeSelectorsOnOutsideClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;

    if (
      this.subjectsSelector?.overlayVisible &&
      !this.subjectsSelectorElement?.nativeElement.contains(target)
    ) {
      this.subjectsSelector.hide();
    }
    if (
      this.teacherSelector?.overlayVisible &&
      !this.teacherSelectorElement?.nativeElement.contains(target)
    ) {
      this.teacherSelector.hide();
    }
  }
}
