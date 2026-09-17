import { Student } from './student.model';
import { Teacher } from './teacher.model';

export interface Message {
  id?: number;
  teacher?: Teacher;
  student?: Student;
  message?: string;
  fileName?: string;
  fileUrl?: string;
  sentAt?: string;
  isRead?: boolean;
}

