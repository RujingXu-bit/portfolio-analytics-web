# Portfolio Analytics Web

Independent Next.js frontend for the
[Portfolio Analytics API v1.1.0](https://github.com/RujingXu-bit/portfolio-analytics-api/releases/tag/v1.1.0).
It presents explainable historical portfolio metrics without implying live
trading, forecasts, or investment advice.

## Current scope

F1.1 establishes the production-oriented frontend foundation:

- Node.js 24, Next.js 16 App Router, TypeScript, pnpm, and Tailwind CSS.
- A committed backend v1.1.0 OpenAPI snapshot with generated TypeScript types.
- Same-origin Route Handlers as a narrow BFF allowlist.
- Automatic login after registration.
- Short-lived access tokens held only in HttpOnly, Secure, SameSite=Lax cookies.
- Origin validation for writes, `no-store` private responses, cookie removal on
  401, and client redirection to `/login`.
- Unit tests that verify the token does not enter response bodies or client code.

The complete English dashboard and demo flow are delivered by F1.2.

## Local setup

Install Node.js 24 and pnpm 11.9.0, then:

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Run the backend separately at the server-only `API_BASE_URL`. The browser calls
only this app's `/api/*` handlers, so FastAPI CORS must remain disabled.

For local plain HTTP only, `.env.example` sets `SESSION_COOKIE_SECURE=false`.
Production ignores that escape hatch and always emits `Secure` cookies.

## Quality gates

```bash
pnpm check
pnpm build
```

Refresh the API snapshot only when intentionally upgrading the pinned backend
release, then regenerate and commit the declarations:

```bash
pnpm api:types:generate
pnpm api:types:check
```

See [docs/architecture.md](docs/architecture.md) for the trust boundary and
route policy.
