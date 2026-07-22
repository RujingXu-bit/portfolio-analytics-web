import "server-only";

import { trustedAppOrigin } from "@/lib/server/config";

export class InvalidOriginError extends Error {
  constructor() {
    super("Write requests require an exact same-origin Origin header");
    this.name = "InvalidOriginError";
  }
}

export function requireSameOrigin(request: Request): void {
  const supplied = request.headers.get("origin");
  if (!supplied) {
    throw new InvalidOriginError();
  }

  let suppliedOrigin: string;
  try {
    suppliedOrigin = new URL(supplied).origin;
  } catch {
    throw new InvalidOriginError();
  }

  if (supplied !== suppliedOrigin || suppliedOrigin !== trustedAppOrigin(request.url)) {
    throw new InvalidOriginError();
  }
}
