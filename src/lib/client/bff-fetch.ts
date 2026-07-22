"use client";

type UnauthorizedHandler = () => void;

function defaultUnauthorizedHandler(): void {
  window.location.assign("/login?session=expired");
}

export async function bffFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  onUnauthorized: UnauthorizedHandler = defaultUnauthorizedHandler,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
  });
  if (response.status === 401) onUnauthorized();
  return response;
}
