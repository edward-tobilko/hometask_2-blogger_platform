# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn dev                  # Start with hot reload on port 3000

# Build
yarn build                # Compile TypeScript to dist/

# Testing
yarn test                 # Run all tests (unit then e2e)
yarn test:unit            # Unit tests only
yarn test:e2e             # E2E tests only (sequential, uses test DB)

# A single test file
yarn test:unit -- --testPathPattern=<filename>
yarn test:e2e -- --testPathPattern=<filename>

# Code quality
yarn lint                 # ESLint with auto-fix
yarn format               # Prettier
```

## Architecture

This is a **blogging platform REST API** (blogs, posts, comments, users, auth) built with Express 5 + TypeScript + MongoDB/Mongoose, using **Domain-Driven Design (DDD)** and **InversifyJS** for dependency injection.

### Module layout

Each domain module (`blogs/`, `posts/`, `comments/`, `users/`, `auth/`, `security-devices/`) is divided into four layers:

```
<module>/
├── presentation/    # Controllers, route definitions, request DTOs
├── application/     # Services (writes), query services (reads), interfaces/contracts
├── domain/          # Entity classes, value objects, mappers, factory methods
└── infrastructure/  # Repository implementations, Mongoose schemas, external adapters
```

`core/` holds cross-cutting concerns: DI config, custom errors, the `ApplicationResult` wrapper, middlewares, logger (Pino), and env config.

### Key patterns

**CQRS (lightweight):** Read operations go through `*QueryService` + `*QueryRepository`; write operations use `*Service` + `*Repository`. This keeps complex paginated reads separate from domain mutations.

**Result pattern:** All service methods return `ApplicationResult<T>` with a status enum (`Success`, `BadRequest`, `NotFound`, `Forbidden`, etc.). Controllers map this status to HTTP codes via `map-app-status-to-http.result.ts`.

**Repository + reconstitution:** Repositories return domain entities, not raw Mongoose documents. A reconstitution step converts DB documents to entity instances.

**Dependency injection:** InversifyJS with Symbol tokens defined in `core/di/`. The composition root (`composition-root.ts`) wires everything together after DB connection is established.

**Authentication:** JWT access token (short-lived) + refresh token (long-lived, rotated on each use, stored in `login-session` collection with TTL index). Refresh tokens are delivered via `httpOnly` cookie.

### Environment configuration

Env files: `.env.development.local`, `.env.test.local`, `.env.production.local`. Key variables:

```
MONGO_URL, DB_NAME
AT_SECRET, AT_TIME, RT_SECRET, RT_TIME
EMAIL, EMAIL_PASS
ADMIN_USERNAME, ADMIN_PASSWORD
DISABLE_RATE_LIMIT
```

The `appConfig` object in `src/core/settings/config.ts` is the single source of truth — always use it instead of `process.env` directly.

### Testing

- **Unit tests** live in `src/__tests__/unit/`, match `*.unit.(spec|test).ts`, run fast in parallel.
- **E2E tests** live in `src/__tests__/e2e/`, run sequentially (`maxWorkers: 1`) against a real test-database, use Supertest. Shared test helpers live in `src/__tests__/e2e/utils/`.
- E2E tests require a running MongoDB instance pointed to by `.env.test.local`.
