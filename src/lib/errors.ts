import { DEFAULT_ERROR_MESSAGE } from "../constants";
import type { AppError } from "../types";

export function describeError(error: unknown): string {
  return isAppError(error) ? error.message : DEFAULT_ERROR_MESSAGE;
}

function isAppError(error: unknown): error is AppError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as AppError).message === "string"
  );
}
