import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Student } from './student';
import { Auth } from '../../../../core/services/auth';
import { StudentService } from '../../../../services/student.service';
import { DocumentService } from '../../../../services/document.service';
import { TaskService } from '../../../../services/task.service';
import { MessageService } from '../../../../core/services/message.service';

describe('Student', () => {
  let component: Student;
  let fixture: ComponentFixture<Student>;

  beforeEach(async () => {
    // Stub every collaborator so this spec never performs real HTTP requests.
    await TestBed.configureTestingModule({
      imports: [Student],
      providers: [
        { provide: Auth, useValue: { logout: () => undefined } },
        { provide: StudentService, useValue: { getMyProfile: () => of(null) } },
        {
          provide: DocumentService,
          useValue: {
            getMyDocuments: () => of([]),
            markAsRead: () => of({})
          }
        },
        {
          provide: TaskService,
          useValue: {
            getMyTasks: () => of([]),
            markTaskAsRead: () => of({}),
            submitTask: () => of({})
          }
        },
        {
          provide: MessageService,
          useValue: {
            getMyMessages: () => of([]),
            markAsRead: () => of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Student);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
