# Web architecture

## Trust boundary

```text
Browser
  | same-origin /api/* only
  v
Next.js Route Handlers (BFF)
  | server-only API_BASE_URL + Bearer token
  v
Ledger Lens API v1.2.0
  |                 |
PostgreSQL          Redis
```

The browser never calls FastAPI directly. Login and registration responses are
consumed by the BFF, which stores the short-lived access token in an HttpOnly,
Secure, SameSite=Lax cookie. Client JavaScript receives only session state and
domain response data.

The BFF exposes authentication handlers and one narrowly validated portfolio
route family. It does not accept arbitrary upstream URLs. All private responses
use `Cache-Control: no-store`; write requests require an exact configured
same-origin `Origin`; and an upstream 401 expires the cookie. The client request
helper redirects to `/login` after a 401.

## API contract

`openapi/portfolio-analytics-api-v1.2.0.json` is a fixed snapshot from the
published backend version. `openapi-typescript` generates
`src/lib/api/schema.d.ts`, while CI regenerates to a temporary file and fails if
the committed types drift.

The frontend does not require FastAPI CORS because cross-origin browser requests
are not part of this architecture.

CSV preview and commit are the only non-JSON portfolio writes exposed by the
BFF. Both paths are matched exactly, require the same-origin `Origin`, accept at
most 1,000,000 raw `text/csv` bytes, and forward those bytes unchanged. The
browser must preview the selected `File` before commit and sends the same `File`
object to both calls; changing the file invalidates the preview. FastAPI remains
authoritative for UTF-8 parsing, the 500-row limit, ownership, Decimal values,
ledger rules, and idempotency.

## UI routes and data provenance

| Route | Source | Purpose |
|---|---|---|
| `/` | Static | Product boundary, architecture, and project links |
| `/demo` | Committed fixture | Network-independent outage and interview demo |
| `/register`, `/login` | Same-origin auth BFF | Establish an HttpOnly session |
| `/portfolios` | Owner-scoped FastAPI data | List and create workspaces |
| `/portfolios/{id}` | Owner-scoped FastAPI data | Ledger, CSV import, analytics, insight, and history flow |

The deterministic fixture reuses presentation components but passes an explicit
`fixture` provenance value, so it never labels sample values as provider-backed.
Analytics is not fetched on page load: users choose a period and explicitly run
it. Risk summaries require a second explicit action. Snapshot history is loaded
newest-first from the pinned backend query API.

## Validation boundary

Vitest and Testing Library cover pure formatting, stable error mapping,
conditional form fields, CSV state/error mapping, stale/fixture provenance, and
client-source token scans. Playwright starts a test-only in-memory HTTP adapter
behind the real BFF and completes registration, Portfolio creation, preview and
partial CSV commit, idempotent replay, analytics, insight generation, and
history reload. The adapter is isolated under
`tests/e2e` and does not ship in the Next.js build.
