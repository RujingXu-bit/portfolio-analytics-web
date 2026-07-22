import "server-only";

const MAX_JSON_BODY_BYTES = 32_768;
export const MAX_CSV_BODY_BYTES = 1_000_000;

export class InvalidJsonBodyError extends Error {
  constructor() {
    super("A JSON object request body is required");
    this.name = "InvalidJsonBodyError";
  }
}

export class UnexpectedRequestBodyError extends Error {
  constructor() {
    super("This request does not accept a request body");
    this.name = "UnexpectedRequestBodyError";
  }
}

export class InvalidCsvBodyError extends Error {
  constructor(message = "A UTF-8 text/csv request body is required") {
    super(message);
    this.name = "InvalidCsvBodyError";
  }
}

export async function requireEmptyBody(request: Request): Promise<void> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && Number(declaredLength) > 0) {
    throw new UnexpectedRequestBodyError();
  }
  if (request.body === null) return;

  const reader = request.body.getReader();
  const first = await reader.read();
  await reader.cancel();
  if (!first.done || (first.value?.byteLength ?? 0) > 0) {
    throw new UnexpectedRequestBodyError();
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

export async function readCsvBody(request: Request): Promise<ArrayBuffer> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0];
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (
    contentType !== "text/csv" ||
    !Number.isFinite(declaredLength) ||
    declaredLength > MAX_CSV_BODY_BYTES
  ) {
    throw new InvalidCsvBodyError();
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    throw new InvalidCsvBodyError("The CSV file is empty");
  }
  if (body.byteLength > MAX_CSV_BODY_BYTES) {
    throw new InvalidCsvBodyError("The CSV file exceeds the 1 MB limit");
  }
  return body;
}
