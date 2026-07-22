import "server-only";

const MAX_JSON_BODY_BYTES = 32_768;

export class InvalidJsonBodyError extends Error {
  constructor() {
    super("A JSON object request body is required");
    this.name = "InvalidJsonBodyError";
  }
}

export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0];
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (
    contentType !== "application/json" ||
    !Number.isFinite(contentLength) ||
    contentLength > MAX_JSON_BODY_BYTES
  ) {
    throw new InvalidJsonBodyError();
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    throw new InvalidJsonBodyError();
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new InvalidJsonBodyError();
  }
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new InvalidJsonBodyError();
  }
  return value as Record<string, unknown>;
}
