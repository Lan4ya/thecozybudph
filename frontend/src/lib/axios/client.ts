import axios from "axios";
import { supabase } from "@/lib/supabase/client";
import type { ApiResponseError, ApiResponseSuccess } from "@TheCozyBud/schemas";
import isDev from "../utils/isDev";

const { VITE_SUPABASE_URL } = import.meta.env;
const SUPABASE_URL = VITE_SUPABASE_URL;

export const apiClient = axios.create({
  baseURL: `${SUPABASE_URL}/functions/v1`,
});

// Add auth header to all requests if token exists
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // console.log({ session });

  if (session?.access_token)
    config.headers.Authorization = `Bearer ${session.access_token}`;

  return config;
});

apiClient.interceptors.response.use(
  function unwrapApiResponse<T>(response: { data: ApiResponseSuccess<T> }) {
    return response.data.data as T;
  },
  function normalizeApiError(error) {
    return Promise.reject(normalizeError(error));
  },
);

const normalizeError = (error: unknown) => {
  isDev && console.error(error);

  if (axios.isAxiosError(error) && error.response?.data?.error) {
    const raw = error.response.data.error as ApiResponseError["error"];
    const status = error.response?.status;

    const message =
      typeof raw === "string"
        ? raw
        : raw
            .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
            .join(",\n");

    return new AppError({
      message,
      status,
      // code: error.code,
    });
  }

  if (error instanceof Error) {
    return error.message;
  }

  return new Error("Unknown error occurred");
};

// export const isAppError = (err: unknown): err is AppError =>
//   typeof err === "object" && err !== null && (err as any).isAppError === true;

export class AppError extends Error {
  status?: number;
  code?: string;

  constructor(params: { message: string; status?: number; code?: string }) {
    super(params.message);
    this.name = "AppError";
    this.status = params.status;
    // this.code = params.code;
  }
}
