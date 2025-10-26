import { CustomError } from "../errors/CustomError";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof CustomError) {
    if (error.message) console.error("Error message:", error.message);

    return res.status(error.statusCode).json({
      msg: error.message ?? undefined,
    });
  }

  console.error("=== ERROR DETAILS ===");
  console.error("Path:", req.path);
  console.error("Time:", new Date().toISOString());
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
  console.error("=====================");

  // Fallback
  return res
    .status(500)
    .json({ msg: "Something went wrong, please try again later." });
};
