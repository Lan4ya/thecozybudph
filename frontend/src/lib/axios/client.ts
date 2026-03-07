import axios from "axios";
import { supabase } from "@/lib/supabase/client";
import type { ApiResponseError } from "@TheCozyBud/types";

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
  function unwrapApiResponse(response) {
    return response.data.data;
  },
  function normalizeApiError(error) {
    return Promise.reject(normalizeHTTPError(error));
  },
);

const normalizeHTTPError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      const httpError = error.response.data.error as ApiResponseError["error"];
      // console.log({ httpError });

      const message =
        typeof httpError === "string"
          ? httpError
          : httpError
              .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
              .join(",\n");

      return new Error(message);
    }

    return new Error(error.message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown error occurred");
};
