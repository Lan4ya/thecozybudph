export type ApiError = string | { message: string; field?: string }[];

export type ApiResponseError = {
  success: false;
  error: ApiError;
};

export type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
