import "server-only";

import { NextResponse } from "next/server";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
} as const;

export function privateJson(
  body: unknown,
  init: { status?: number; headers?: HeadersInit } = {},
): NextResponse {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(PRIVATE_HEADERS)) {
    headers.set(key, value);
  }
  return NextResponse.json(body, { status: init.status, headers });
}

export function bffError(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return privateJson({ error: { code, message } }, { status });
}

export function invalidOriginResponse(): NextResponse {
  return bffError(403, "invalid_origin", "Write requests must be same-origin");
}

export function backendUnavailableResponse(): NextResponse {
  return bffError(
    502,
    "backend_unavailable",
    "The portfolio service is temporarily unavailable",
  );
}

export async function forwardBackendJson(response: Response): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return bffError(502, "invalid_backend_response", "The portfolio service returned an invalid response");
  }

  const headers = new Headers();
  for (const name of ["retry-after", "x-request-id"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return privateJson(body, { status: response.status, headers });
}
