import { SchoolItem } from './school.types';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  grade: string;
  firstName?: string;
  school?: string;
  avatar?: any;
  birth?: string;
}

export interface ExamStats {
  avg_pace: number;
  avg_streaks: number;
  avg_resilience: number;
}

export interface DailyStats {
  avg_pace: number;
  avg_streaks: number;
  avg_resilience: number;
}

export interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Grade {
  id?: number;
  documentId?: string;
  title?: string;
  desc?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  index?: number;
  lastExam?: number | undefined;
  totalExam?: number | undefined;
}

export interface DailyLevel {
  id: number;
  documentId: string;
  level: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title: string;
}

export interface QuestionCollection {
  speed: number;
  answer: string;
  question: string;
  is_correct: boolean;
  question_id: string;
}

export interface ExamResult {
  id: number;
  documentId: string;
  pace: number;
  streaks: number;
  score: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  question_collections: QuestionCollection[];
  resilience: number;
}

export interface DailyResult {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  attempt: number;
  pace: number;
  streaks: number;
  resilience: number;
  score: number;
  question_collections: QuestionCollection[];
}

export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Avatar {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    large?: ImageFormat;
    medium?: ImageFormat;
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  exam_stats?: ExamStats | null;
  daily_stats?: DailyStats | null;
  role?: Role;
  exam_results?: ExamResult[];
  grade?: Grade;
  daily_level?: DailyLevel;
  daily_results?: DailyResult[];
  firstName?: string;
  lastName?: string;
  name?: string;
  school?: SchoolItem;
  avatar?: any;
  birth?: string;
  school_grade?: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
