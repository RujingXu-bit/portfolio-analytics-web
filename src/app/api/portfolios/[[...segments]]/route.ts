import { NextRequest, NextResponse } from "next/server";

import { callBackend, jsonRequest } from "@/lib/server/backend";
import { InvalidOriginError, requireSameOrigin } from "@/lib/server/origin";
import { resolvePortfolioBackendPath } from "@/lib/server/portfolio-allowlist";
import {
  InvalidJsonBodyError,
  readJsonObject,
  requireEmptyBody,
  UnexpectedRequestBodyError,
} from "@/lib/server/request-body";
import {
  backendUnavailableResponse,
  bffError,
  forwardBackendJson,
  invalidOriginResponse,
} from "@/lib/server/responses";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/lib/server/session";

interface RouteContext {
  params: Promise<{ segments?: string[] }>;
}

async function proxy(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "POST",
): Promise<NextResponse> {
  if (method === "POST") {
    try {
      requireSameOrigin(request);
    } catch (error) {
      if (error instanceof InvalidOriginError) return invalidOriginResponse();
      throw error;
    }
  }

  const { segments } = await context.params;
  const backendPath = resolvePortfolioBackendPath(method, segments);
  if (!backendPath) {
    return bffError(404, "route_not_allowed", "This backend route is not exposed");
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const response = bffError(401, "session_required", "Sign in to continue");
    clearSessionCookie(response);
    return response;
  }

  try {
    const headers = new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    });
    let body: string | undefined;
    if (method === "POST") {
      if (backendPath.endsWith("/insights")) {
        await requireEmptyBody(request);
      } else {
        const payload = await readJsonObject(request);
        const serialized = jsonRequest(payload);
        body = serialized.body as string;
        new Headers(serialized.headers).forEach((value, name) => {
          headers.set(name, value);
        });
      }
    }

    const backendResponse = await callBackend(
      `${backendPath}${request.nextUrl.search}`,
      { method, body, headers },
    );
    const response = await forwardBackendJson(backendResponse);
    if (backendResponse.status === 401) clearSessionCookie(response);
    return response;
  } catch (error) {
    if (error instanceof InvalidJsonBodyError) {
      return bffError(400, "invalid_request", error.message);
    }
    if (error instanceof UnexpectedRequestBodyError) {
      return bffError(400, "invalid_request", error.message);
    }
    return backendUnavailableResponse();
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "GET");
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context, "POST");
}
