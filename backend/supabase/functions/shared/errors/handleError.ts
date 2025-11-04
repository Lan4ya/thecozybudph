import { CustomError } from "./CustomError.ts";

export const handleError = (
  err: unknown,
  corsHeaders: Record<string, string> = {},
) => {
  // Handle CustomError with proper status codes
  if (err instanceof CustomError) {
    return Response.json(
      {
        error: err.errors,
        success: false,
      },
      {
        status: err.statusCode,
        headers: corsHeaders,
      },
    );
  }

  // Handle unexpected errors
  console.error("Unexpected error:", err);
  return Response.json(
    {
      error: "Internal server error",
      success: false,
    },
    {
      status: 500,
      headers: corsHeaders,
    },
  );
};
