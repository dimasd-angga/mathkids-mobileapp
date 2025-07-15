export type StrapiErrorResponse = {
  error?: {
    status: number;
    name: string;
    message: string;
    details: Record<string, any>;
  };
  data: null;
};

export interface ApiResponse<T> {
  data: T;
  error: null | string;
}
