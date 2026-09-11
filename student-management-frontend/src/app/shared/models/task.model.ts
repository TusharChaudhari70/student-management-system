export interface Task {
  id?: number;
  student?: { id: number } | null;
  teacher?: { id: number; name?: string } | null;
  title: string;
  description: string;
  type?: string;
  createdAt?: string;
  dueDate?: string;
  isRead?: boolean;
  isSubmitted?: boolean;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  dueDate: string | null;
  isRead: boolean;
  isSubmitted: boolean;
  teacher: {
    id: number;
    name: string;
  };
  student: {
    id: number;
  };
}

export interface CaseStudySubmission {
  fileUrl: string;
  fileName: string;
}
