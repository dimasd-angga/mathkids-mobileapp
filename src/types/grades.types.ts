export interface GradeItem {
  id: number;
  documentId: string;
  title: string;
  desc: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface GradesApiResponse {
  data: GradeItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GradeState {
  grades: GradeItem[];
  isLoading: boolean;
  error: string | null;
}
