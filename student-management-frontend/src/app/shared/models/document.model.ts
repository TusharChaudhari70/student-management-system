export interface Document {
  id?: number;
  student?: { id: number } | null;
  teacher?: { id: number; name?: string } | null;
  title: string;
  description: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  isRead?: boolean;
}

export interface DocumentResponse {
  id: number;
  title: string;
  description: string;
  fileName: string | null;
  fileUrl: string | null;
  uploadedAt: string;
  isRead: boolean;
  teacher: {
    id: number;
    name: string;
  };
  student: {
    id: number;
  };
}
