# Public demo deployment

The production topology is intentionally small and region-aligned:

```text
Browser
  -> Vercel Hobby, Next.js/BFF functions in Frankfurt (`fra1`)
       -> Render Starter Docker API in Frankfurt
            -> Neon PostgreSQL in AWS Frankfurt (`eu-central-1`)
            -> Upstash Redis in the nearest available EU primary region
```

This is a portfolio demonstration, not a production SLA or a high-availability
design. Provider quotas, free-plan availability, and prices can change; verify
them in the provider dashboards immediately before provisioning.

## 1. Provision the backend dependencies

Follow the API repository's `docs/deployment.md` runbook. Create the Neon and
Upstash resources before the Render service, and keep every connection string
in the provider dashboards. Use Neon's pooled TLS connection string with the
`postgresql+asyncpg://` driver prefix and an Upstash read/write `rediss://`
connection string.

Create the Render Blueprint from the API repository's checked-in `render.yaml`.
It pins the Starter Docker service to Frankfurt, runs `alembic upgrade head` as
a pre-deploy command, checks `/health`, generates the JWT and rate-limit HMAC
secrets, and waits for GitHub checks before automatic deploys. Enter only
`DATABASE_URL` and `REDIS_URL` when prompted. Do not configure
`DEEPSEEK_API_KEY`; the public demo deliberately uses the deterministic
`risk-rules-v1` fallback.

Record the resulting HTTPS API origin, for example
`https://portfolio-analytics-api.onrender.com`, without a trailing slash.

## 2. Create the Vercel project

Import `RujingXu-bit/Ledger-Lens-web` into a personal Vercel Hobby
project. Vercel reads Node.js `24.x` and pnpm `11.9.0` from `package.json`; set
`ENABLE_EXPERIMENTAL_COREPACK=1` so the pinned package-manager version is used.
The checked-in `vercel.json` keeps all BFF functions in Frankfurt (`fra1`), near
the API and data services.

Configure these Production environment variables in Vercel:

| Variable | Value | Exposure |
|---|---|---|
| `API_BASE_URL` | Exact Render HTTPS origin, no trailing slash | Server only |
| `APP_ORIGIN` | Exact public Vercel production origin | Server only |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Build only |
| `NEXT_TELEMETRY_DISABLED` | `1` | Build/runtime |

Do not create any `NEXT_PUBLIC_*` copy of the API origin or a token. Do not set
`SESSION_COOKIE_SECURE=false` in Vercel: production must retain the default
Secure, HttpOnly, SameSite=Lax cookie. Limit `APP_ORIGIN` to the canonical
production domain; protected preview deployments are not part of the public
write-path acceptance test.

After the first deployment establishes the final production domain, update
`APP_ORIGIN` to that exact `https://...` origin and redeploy. Keep the
production domain public; preview deployments may remain protected.

## 3. Public acceptance

Run acceptance from a new private/incognito browser session against the
canonical Vercel production domain:

1. Open `/demo` and confirm it says deterministic offline fixture and performs
   no API/provider request.
2. Open registration and confirm this warning is visible: “Demo only. Do not
   enter real financial or sensitive information. Demo data may be reset.”
3. Register a unique synthetic user, create a Portfolio, add idempotent DEPOSIT
   and BUY transactions, and reload the ledger.
4. Explicitly run analytics for a selected date range; confirm all four metrics,
   allocation, `as_of`, methodology, and data provenance render.
5. Explicitly generate a risk summary; confirm generator, limitations, and the
   saved snapshot appear after a page refresh.
6. Confirm a second user cannot read the first user's Portfolio and receives the
   same 404 shape as a missing ID.
7. Inspect browser storage, page source, response bodies, and client console;
   the JWT must not appear. Confirm private BFF responses use `no-store`.
8. Inspect Vercel and Render logs for the acceptance window. Passwords, JWTs,
   email addresses, request bodies, database/Redis URLs, and rate-limit digests
   must not be present.

Repeat the real registration-through-history flow after a fresh browser start.
Also verify the offline `/demo` path while the API is intentionally unavailable;
do not present fixture values as live provider results.

## 4. Migration, rollback, and recovery

Render runs database migration independently before each application deploy.
Do not run schema changes in the application startup command. Before a future
migration, create a provider-supported Neon branch or restore point and review
the migration output.

- Frontend rollback: use Vercel's deployment history to promote the last
  accepted production deployment.
- API rollback: redeploy the last known-good Git commit or release tag in
  Render.
- Database rollback: never run `alembic downgrade` automatically. Review data
  compatibility and obtain explicit authorization before a destructive schema
  operation.
- Redis recovery: cache and fixed-window rate-limit keys are disposable and
  versioned. Redis failure is fail-open for core requests and must produce only
  the sanitized `rate_limit_bypass` event.

After any rollback, repeat `/health`, registration/login, ownership isolation,
analytics, deterministic insight, snapshot history, and log-redaction checks.

## 5. Cost and quota posture

At the 2026-07-22 deployment review, Vercel Hobby was free for personal
projects, Render Starter was listed at USD 7/month, Neon Free included 0.5 GB
per project and scale-to-zero compute, and Upstash Free included 256 MB plus
500,000 monthly commands. These are planning inputs, not guarantees or an SLA.
Check the current official pages before provisioning or quoting them publicly:

- <https://vercel.com/docs/plans/hobby>
- <https://render.com/pricing>
- <https://neon.com/pricing>
- <https://upstash.com/pricing/redis>
