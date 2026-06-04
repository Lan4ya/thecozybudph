import { AppError } from "../../errors/Errors.ts";

// TODO: read this again after creating checkout UI in client for the full workflow:
// https://developers.paymongo.com/docs/accepting-a-payment

// TODO: activate gcash payment method in paymongo dashboard (needs beneficiary
// documents) to properly create live mode payment methods:
// https:dshboard.paymongo.com/payment-methods

// TODO:
// GCash Deep Links: Important Note for App-Based Merchants
// If your customer chooses GCash as the payment method and you are using a mobile app-based checkout experience (e.g., within your iOS or Android app), GCash’s new payment authentication flow includes a deeplink that triggers an “Open in GCash” button. This button attempts to open the GCash mobile app directly so the customer can complete their payment.
// To ensure this works correctly:
//    iOS and Android apps must support gcash:// deeplinks.
//    Without proper handling, the “Open in GCash” button will not work (e.g., it may do nothing or show an error).
//    Customers can still scan the QR code, but the in-app redirection flow will not function as intended.

const BASE_URL = "https://api.paymongo.com/v1";

const defaultHeaders = {
  Authorization: `Basic ${btoa(Deno.env.get("PAYMONGO_SECRET_KEY") + ":")}`,
  "Content-Type": "application/json",
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json: unknown;

  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new AppError({
      status: res.status,
      message: "Paymongo request failed",
      cause: json,
    });
  }

  return (json as { data: T }).data;
}

export const paymongoClient = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body,
    }),

  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body,
    }),

  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body,
    }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "DELETE",
    }),
};
