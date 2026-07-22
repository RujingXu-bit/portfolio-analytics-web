import { NextRequest } from "next/server";

import { privateJson } from "@/lib/server/responses";
import { SESSION_COOKIE_NAME } from "@/lib/server/session";

export function GET(request: NextRequest) {
  return privateJson({
    authenticated: Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value),
  });
}
