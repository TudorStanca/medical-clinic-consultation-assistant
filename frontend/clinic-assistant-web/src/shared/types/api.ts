export interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  errors: string[];
}

export interface CustomErrorResponse {
  statusCode: number;
  description: string;
}
