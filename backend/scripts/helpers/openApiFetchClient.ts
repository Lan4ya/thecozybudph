import {
  EDGE_FUNCTIONS,
  type ApiErrorResponse,
  type OpenApiPaths,
} from "@cozybud/schemas";
import createClient, { type Middleware } from "openapi-fetch";
import { AppError } from "./errors.ts";
import { supabase } from "./supabase.ts";

const middleware: Middleware = {
  async onRequest({ request }) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      request.headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return request;
  },

  async onResponse({ response }) {
    if (!response.ok) {
      const text = await response.text();

      let message = `Request failed with status ${response.status}`;
      let code = "UNKNOWN_ERROR";
      let details: unknown;

      try {
        const body = JSON.parse(text) as ApiErrorResponse;
        console.log(body);
        if (body?.message) {
          message = body.message ?? message;
          code = body.code ?? code;
          details = body.details;
        } else {
          details = body;
        }
      } catch {
        details = text;
      }

      console.error("API Error Response:", {
        status: response.status,
        message,
        code,
        details,
      });

      throw new AppError({
        message,
        status: response.status,
        code,
        details,
      });
    }

    return response;
  },

  async onError({ error }) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new AppError({
      message: errorMessage ?? "Network request failed",
      status: 0,
      code: "NETWORK_ERROR",
    });
  },
};

// Helper to unwrap response data
export function unwrapData<T>(
  data: { data: T } | null | undefined,
  context: string,
): T {
  if (data == null) {
    throw new AppError({
      message: `Expected response body but got ${data} for ${context}`,
      code: "MISSING_RESPONSE_DATA",
      status: 200,
    });
  }
  return data.data;
}

const { SUPABASE_URL } = process.env;
const baseUrl = `${SUPABASE_URL}/functions/v1`;

function createApiClient<TKey extends keyof OpenApiPaths>() {
  const client = createClient<OpenApiPaths[TKey]>({ baseUrl });
  client.use(middleware);
  return client;
}

type ClientMap = {
  [K in keyof OpenApiPaths]: ReturnType<typeof createClient<OpenApiPaths[K]>>;
};

// Client wrapper for the api paths from each supabase edege functions
export const openApiClient = {} as ClientMap;

for (const key of EDGE_FUNCTIONS) {
  const c = createApiClient<typeof key>();
  openApiClient[key] = c;
}
