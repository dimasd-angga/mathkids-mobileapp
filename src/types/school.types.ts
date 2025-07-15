export interface SchoolItem {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface SchoolsApiResponse {
  data: SchoolItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SchoolState {
  schools: SchoolItem[];
  isLoading: boolean;
  error: string | null;
}
