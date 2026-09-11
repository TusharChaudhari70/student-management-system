export interface Student {
  id?: number;
  name: string;
  email: string;
  course: string;
  age: number;
  teacher?: {
    id: number;
    name?: string;
    username?: string;
    email?: string;
  } | null;
  user?: {
    id: number;
    username: string;
    role: string;
    name?: string;
    email?: string;
  } | null;
  isDeleted?: boolean;
}

