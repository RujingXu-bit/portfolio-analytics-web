# Changelog

All notable changes to Portfolio Analytics Web are documented here.

## [1.0.0] - 2026-07-22

### Added

- Professional English landing page and explicitly labelled deterministic
  offline demo.
- Secure Next.js BFF authentication with HttpOnly, Secure, SameSite=Lax session
  cookies and an explicit FastAPI route allowlist.
- Registration, login, logout, Portfolio list/create, conditional transaction
  ledger entry, explicit historical analytics, allocation, methodology, stale
  provenance, risk summaries, and snapshot history.
- Fixed backend v1.1.0 OpenAPI snapshot with generated TypeScript declarations
  and CI drift detection.
- Vitest/Testing Library tests and a Playwright registration-to-history flow at
  mobile, tablet, and desktop widths.
- Branded 1200×630 Open Graph social preview.

### Security

- Access tokens never enter page payloads, browser storage, client logs, or
  browser-readable cookies.
- Same-origin validation on writes, `no-store` private responses, session expiry
  on backend 401, bounded JSON bodies, and dependency audit overrides for known
  vulnerable transitive releases.
