import { NextRequest } from "next/server";

import { callBackend, jsonRequest } from "@/lib/server/backend";
import { InvalidOriginError, requireSameOrigin } from "@/lib/server/origin";
import { InvalidJsonBodyError, readJsonObject } from "@/lib/server/request-body";
import {
  backendUnavailableResponse,
  bffError,
  forwardBackendJson,
  invalidOriginResponse,
  privateJson,
} from "@/lib/server/responses";
import { setSessionCookie } from "@/lib/server/session";

interface LoginResult {
  access_token: string;
  expires_in: number;
}

function isLoginResult(value: unknown): value is LoginResult {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.access_token === "string" &&
    candidate.access_token.length > 0 &&
    Number.isInteger(candidate.expires_in) &&
    Number(candidate.expires_in) > 0 &&
    Number(candidate.expires_in) <= 604_800
  );
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const credentials = await readJsonObject(request);
    const backendResponse = await callBackend(
      "/auth/login",
      { method: "POST", ...jsonRequest(credentials) },
    );
    if (!backendResponse.ok) return forwardBackendJson(backendResponse);

    const result: unknown = await backendResponse.json();
    if (!isLoginResult(result)) {
      return bffError(502, "invalid_backend_response", "The portfolio service returned an invalid login response");
    }

    const response = privateJson({
      authenticated: true,
      expires_in: result.expires_in,
    });
    setSessionCookie(response, result.access_token, result.expires_in);
    return response;
  } catch (error) {
    if (error instanceof InvalidOriginError) return invalidOriginResponse();
    if (error instanceof InvalidJsonBodyError) {
      return bffError(400, "invalid_request", error.message);
    }
    return backendUnavailableResponse();
  }
}
