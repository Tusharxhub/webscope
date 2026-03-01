import { NextResponse } from "next/server";

export type ErrorType =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NETWORK"
  | "DISALLOWED_BY_ROBOTS"
  | "TIMEOUT"
  | "DATABASE"
  | "UNKNOWN";

export interface ApiErrorResponse {
  success: false;
  errorType: ErrorType;
  message: string;
  error?: string;
}

type ErrorWithCode = {
  code?: string;
  message?: string;
};

export function getErrorMessage(error: unknown, fallback = "Internal server error"): string {
  return error instanceof Error ? error.message : fallback;
}

export function getErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as ErrorWithCode).code === "string"
  ) {
    return (error as ErrorWithCode).code as string;
  }

  return null;
}

export function toApiError(errorType: ErrorType, message: string): ApiErrorResponse {
  return {
    success: false,
    errorType,
    message,
    error: message,
  };
}

export function jsonApiError(
  errorType: ErrorType,
  message: string,
  status: number
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(toApiError(errorType, message), { status });
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Operation timed out"
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

export function classifyPrismaError(error: unknown): { type: ErrorType; message: string; status: number } {
  const code = getErrorCode(error);

  if (["P1000", "P1001", "P1002", "P1017"].includes(code || "")) {
    return {
      type: "DATABASE",
      message: "Database connection failed. Check DATABASE_URL and database availability.",
      status: 503,
    };
  }

  if (["P2021", "P2022"].includes(code || "")) {
    return {
      type: "DATABASE",
      message: "Database schema is out of sync. Run Prisma migrations (or db push) on the production database.",
      status: 503,
    };
  }

  if (code === "P2003") {
    return {
      type: "UNAUTHORIZED",
      message: "Session is no longer valid. Please sign in again.",
      status: 401,
    };
  }

  return {
    type: "UNKNOWN",
    message: getErrorMessage(error),
    status: 500,
  };
}
