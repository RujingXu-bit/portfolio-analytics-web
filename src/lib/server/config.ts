import "server-only";

function parseHttpUrl(value: string, name: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${name} must not contain credentials, a query, or a fragment`);
  }
  return parsed;
}

export function backendBaseUrl(): URL {
  const value = process.env.API_BASE_URL;
  if (!value) {
    throw new Error("API_BASE_URL is required");
  }
  const url = parseHttpUrl(value, "API_BASE_URL");
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }
  return url;
}

export function trustedAppOrigin(requestUrl: string): string {
  const configured = process.env.APP_ORIGIN;
  return parseHttpUrl(
    configured ?? new URL(requestUrl).origin,
    "APP_ORIGIN",
  ).origin;
}

export function sessionCookieIsSecure(): boolean {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return process.env.SESSION_COOKIE_SECURE !== "false";
}
