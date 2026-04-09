import axios from "axios";
import { supabase } from "@/lib/supabase/client";
import type { ApiResponseError, ApiResponseSuccess } from "@TheCozyBud/types";

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
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    const httpError = error.response.data.error as ApiResponseError["error"];

    const errorMessage =
      typeof httpError === "string"
        ? httpError
        : httpError
            .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
            .join(",\n");

    // console.log({ httpError });
    return new Error(errorMessage);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return new Error("Unknown error occurred");
};
