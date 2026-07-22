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

interface RegisteredUser {
  id: string;
  email: string;
}

interface LoginResult {
  access_token: string;
  expires_in: number;
}

function registeredUser(value: unknown): RegisteredUser | null {
  if (value === null || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.email === "string"
    ? { id: candidate.id, email: candidate.email }
    : null;
}

function loginResult(value: unknown): LoginResult | null {
  if (value === null || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.access_token === "string" &&
    candidate.access_token.length > 0 &&
    Number.isInteger(candidate.expires_in) &&
    Number(candidate.expires_in) > 0 &&
    Number(candidate.expires_in) <= 604_800
    ? {
        access_token: candidate.access_token,
        expires_in: Number(candidate.expires_in),
      }
    : null;
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const credentials = await readJsonObject(request);
    const registration = await callBackend(
      "/auth/register",
      { method: "POST", ...jsonRequest(credentials) },
    );
    if (!registration.ok) return forwardBackendJson(registration);

    const user = registeredUser(await registration.json());
    if (!user) {
      return bffError(502, "invalid_backend_response", "The portfolio service returned an invalid registration response");
    }

    const login = await callBackend(
      "/auth/login",
      { method: "POST", ...jsonRequest(credentials) },
    );
    if (!login.ok) return forwardBackendJson(login);
    const session = loginResult(await login.json());
    if (!session) {
      return bffError(502, "invalid_backend_response", "The portfolio service returned an invalid login response");
    }

    const response = privateJson({
      authenticated: true,
      expires_in: session.expires_in,
      user,
    });
    setSessionCookie(response, session.access_token, session.expires_in);
    return response;
  } catch (error) {
    if (error instanceof InvalidOriginError) return invalidOriginResponse();
    if (error instanceof InvalidJsonBodyError) {
      return bffError(400, "invalid_request", error.message);
    }
    return backendUnavailableResponse();
  }
}
