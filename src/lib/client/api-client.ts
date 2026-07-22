"use client";

import { bffFetch } from "@/lib/client/bff-fetch";
import type { ApiErrorShape } from "@/lib/api/types";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly retryAfterSeconds: number | null,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await bffFetch(input, init);
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiRequestError(
        "The service returned an unreadable response.",
        502,
        "invalid_response",
        null,
      );
    }
  }

  if (!response.ok) {
    const error = body as ApiErrorShape | null;
    const retryAfter = response.headers.get("retry-after");
    throw new ApiRequestError(
      error?.error?.message ?? "The request could not be completed.",
      response.status,
      error?.error?.code ?? "request_failed",
      retryAfter === null ? null : Number(retryAfter),
    );
  }
  return body as T;
}

export function userFacingError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 429) {
      return error.retryAfterSeconds && Number.isFinite(error.retryAfterSeconds)
        ? `Too many requests. Try again in ${error.retryAfterSeconds} seconds.`
        : "Too many requests. Please wait a moment and try again.";
    }
    const messages: Record<string, string> = {
      authentication_failed: "Your email or password was not accepted.",
      email_already_registered: "An account already exists for this email.",
      portfolio_conflict: "A portfolio with this name already exists.",
      transaction_idempotency_conflict:
        "This transaction reference was already used with different details.",
      market_data_not_found:
        "Market data was not available for one of the symbols.",
      market_data_unavailable:
        "Market data is temporarily unavailable. Your transactions are safe.",
      market_data_timeout:
        "The market data provider timed out. Please try again later.",
      analytics_unavailable:
        "There is not enough portfolio data for this analysis period.",
      invalid_transaction: "This transaction conflicts with the current holdings.",
      invalid_csv: "Choose a valid UTF-8 CSV file no larger than 1 MB.",
      csv_import_invalid: "The CSV could not be parsed. Check the template and try again.",
      validation_error: "Check the highlighted values and try again.",
    };
    return messages[error.code] ?? error.message;
  }
  return "Something unexpected happened. Please try again.";
}

export function jsonBody(value: unknown): Pick<RequestInit, "body" | "headers"> {
  return {
    body: JSON.stringify(value),
    headers: { "Content-Type": "application/json" },
  };
}
