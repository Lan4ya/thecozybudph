import type { ApiResponseError } from "@TheCozyBud/types";
import axios from "axios";

export const normalizeHTTPError = (error: unknown) => {
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
