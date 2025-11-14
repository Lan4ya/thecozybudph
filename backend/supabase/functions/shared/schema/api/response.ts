export type ApiResponseError = {
  success: false;
  error: string | { message: string; field?: string }[];
};

export type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
