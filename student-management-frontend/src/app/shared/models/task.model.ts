export interface Task {
  id?: number;
  student?: { id: number } | null;
  teacher?: { id: number; name?: string } | null;
  title: string;
  description: string;
  type?: string;
  createdAt?: string;
  dueDate?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  isRead?: boolean;
  isSubmitted?: boolean;
  submissionText?: string | null;
  submissionFileName?: string | null;
  submissionFileUrl?: string | null;
  submittedAt?: string | null;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  dueDate: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  isRead: boolean;
  isSubmitted: boolean;
  submissionText?: string | null;
  submissionFileName?: string | null;
  submissionFileUrl?: string | null;
  submittedAt?: string | null;
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
