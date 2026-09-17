import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Admin } from './admin';
import { SubjectService } from '../../../services/subject.service';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;

  beforeEach(async () => {
    // Stub the subjects dropdown source so this spec never performs real HTTP requests.
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        { provide: SubjectService, useValue: { getAllSubjects: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
