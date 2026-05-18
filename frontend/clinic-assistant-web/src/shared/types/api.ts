export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PagedQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  errors: string[];
}

export interface CustomErrorResponse {
  statusCode: number;
  description: string;
}
