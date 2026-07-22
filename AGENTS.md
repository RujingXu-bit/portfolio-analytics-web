# Ledger Lens Web execution rules

This repository is the independent web client for the Ledger Lens API.
Work on one Task ID at a time and keep the backend `PROJECT_PLAN.md` authoritative.

## Runtime and package management

- Use Node.js 24, Next.js 16 App Router, TypeScript, pnpm, and Tailwind CSS.
- Use `pnpm`; do not add npm, Yarn, or Bun lockfiles.
- Commit the fixed backend OpenAPI snapshot and generated TypeScript declarations.
- Run `pnpm check` and `pnpm build` before completing a task.

## Authentication boundary

- The browser only calls same-origin Next.js Route Handlers.
- The FastAPI access token is stored only in an HttpOnly, Secure,
  SameSite=Lax cookie.
- Never expose the token to a Client Component, page payload, response body,
  Local Storage, Session Storage, URL, analytics event, or log.
- BFF routes proxy only explicitly allowlisted FastAPI paths.
- Private reads use `no-store`; writes require an exact same-origin `Origin`.
- A backend 401 must clear the session cookie, and client navigation must return
  the user to `/login`.
- Do not enable backend CORS for this architecture.

## Product boundaries

- The interface is English and presents explainable historical analytics.
- Do not imply live trading, forecasts, automated advice, or guaranteed returns.
- Do not add edit/delete, refresh tokens, multiple currencies, or account admin
  before the authoritative plan explicitly schedules them.
