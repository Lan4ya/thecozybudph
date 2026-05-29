import { isAuthApiError, isAuthError } from "@supabase/supabase-js";

export const formatPriceCents = (priceCents = 0) => {
  const pesos = priceCents / 100;

  return pesos.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export function formatFileSize(n: number) {
  return n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} kB`
      : `${(n / 1048576).toFixed(1)} MB`;
}

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const capitalizeFirstLetterOfEachWord = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const parseDateString = (dateString: string): Date => {
  return new Date(dateString);
};

export const handleError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
};

export const handleSupabaseAuthError = (err: unknown): string => {
  const fallbackMessage = "Something went wrong. Please try again";
  let message = fallbackMessage;

  if (isAuthApiError(err)) {
    if (err.status === 429 || err.code === "over_email_send_rate_limit") {
      message = "Too many requests. Please wait a moment before trying again.";
    } else {
      message = err.message;
    }
  } else if (isAuthError(err)) {
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // The literal string "{}" is a quirk of how the Supabase auth client (gotrue-js) packages network failures.
  if (!message || message === "{}" || message.trim() === "") {
    return fallbackMessage;
  }

  return message;
};
