import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Teacher } from './teacher';
import { Auth } from '../../../core/services/auth';
import { StudentService } from '../../../services/student.service';
import { TeacherService } from '../../../services/teacher.service';
import { TaskService } from '../../../services/task.service';
import { MessageService } from '../../../core/services/message.service';
import { SubjectService } from '../../../services/subject.service';

describe('Teacher', () => {
  let component: Teacher;
  let fixture: ComponentFixture<Teacher>;

  beforeEach(async () => {
    // Stub every collaborator so this spec never performs real HTTP requests.
    await TestBed.configureTestingModule({
      imports: [Teacher],
      providers: [
        { provide: Auth, useValue: { logout: () => undefined } },
        { provide: TeacherService, useValue: { getProfile: () => of(null) } },
        {
          provide: StudentService,
          useValue: {
            getAllStudents: () => of([]),
            addStudent: () => of({}),
            updateStudent: () => of({}),
            deleteStudent: () => of(0)
          }
        },
        {
          provide: MessageService,
          useValue: {
            getTeacherSentMessages: () => of([]),
            sendMessage: () => of({})
          }
        },
        { provide: TaskService, useValue: { assignTaskToStudent: () => of({}) } },
        { provide: SubjectService, useValue: { getAllSubjects: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Teacher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
