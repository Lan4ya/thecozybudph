export type ApiResponseError = {
  error: string | { message: string; field?: string }[];
};

export type ApiResponseSuccess<T> = {
  data: T;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
