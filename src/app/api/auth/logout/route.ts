import { NextRequest } from "next/server";

import { InvalidOriginError, requireSameOrigin } from "@/lib/server/origin";
import { invalidOriginResponse, privateJson } from "@/lib/server/responses";
import { clearSessionCookie } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
  } catch (error) {
    if (error instanceof InvalidOriginError) return invalidOriginResponse();
    throw error;
  }

  const response = privateJson({ authenticated: false });
  clearSessionCookie(response);
  return response;
}
