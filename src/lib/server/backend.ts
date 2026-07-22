import "server-only";

import { backendBaseUrl } from "@/lib/server/config";

const BACKEND_TIMEOUT_MS = 20_000;

export async function callBackend(
  path: string,
  init: Pick<RequestInit, "method" | "body" | "headers"> = {},
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const target = new URL(normalizedPath, backendBaseUrl());
  return fetch(target, {
    method: init.method,
    body: init.body,
    headers: init.headers,
    cache: "no-store",
    credentials: "omit",
    redirect: "manual",
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}

export function jsonRequest(body: unknown): Pick<RequestInit, "body" | "headers"> {
  return {
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
}
