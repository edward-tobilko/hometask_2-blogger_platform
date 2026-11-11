# Blogger Platform API

A production-ready REST API for a blogging platform featuring full user account management, JWT authentication, blogs, posts, comments and security devices. Built with **NestJS**, **TypeScript**, **PostgreSQL** and **TypeORM**, following **Domain-Driven Design** principles.

**Live Demo:** https://hometask-2-blogger-platform.fly.dev/api

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Framework      | NestJS 11, Express 5                       |
| Language       | TypeScript 5.7                             |
| Database       | PostgreSQL + TypeORM (all modules)         |
| Schema         | TypeORM migrations (`synchronize` is off)  |
| Indexing       | B-tree (composite, partial), GIN `pg_trgm` |
| Authentication | JWT (access + refresh tokens), Passport.js |
| Validation     | class-validator, class-transformer         |
| API Docs       | Swagger / OpenAPI (@nestjs/swagger)        |
| Email          | Nodemailer                                 |
| Testing        | Jest, Supertest                            |
| Deployment     | Fly.io, Docker, Neon (PostgreSQL cloud)    |

---

## Architecture

The project follows **Domain-Driven Design (DDD)** with a **CQRS** pattern for separating reads and writes.

### Module Structure

Each domain module is split into four layers:

```
<module>/
├── api/             # Controllers, Decorators, Constraints and Input/View DTOs
├── application/     # UseCases (writes), Queries (reads), Event Handlers
├── domain/          # Domain DTOs and Events
└── infrastructure/
    └── sql/         # TypeORM repositories + rich ORM entities
```

There is no separate `domain/entities/` layer: the ORM entity (`*-orm.entity.ts`) is the rich domain model — columns plus a static `create()` factory and domain methods that enforce invariants (e.g. `CommentOrmEntity.assertOwnedBy()`). This is a conscious trade-off to avoid mapping between two parallel models.

### Modules

- **`bloggers-platform/`** — blogs, posts, comments, likes, subscriptions (PostgreSQL/TypeORM)
- **`user-accounts/`** — users, auth, security-devices, guards (PostgreSQL/TypeORM)
- **`integrations/`** — Telegram notifications
- **`core/`** — shared decorators, exceptions, pipes, constants, DTOs, enums and utils
- **`config/`** — TypeORM module, Config module, Throttler module

### Key Patterns

- **CQRS:** Controllers dispatch commands/queries via `CommandBus`/`QueryBus`. No business logic in controllers. Commands return only an `id` (or nothing); the response view is read through a query.
- **DTO boundaries:** controllers map API input DTOs to domain DTOs explicitly before dispatching a command, so use cases never depend on the `api/` layer.
- **Domain Events:** mutations publish events via `EventBus` after successful persistence. Handlers wrapped in try/catch to prevent unhandled rejections.
- **External Repositories:** cross-module access goes through `*ExternalRepository` / `*ExternalQueryRepository` exported by the owning module, exposing only the minimal operations other modules need. Direct imports of another module's internals are forbidden.
- **Exception handling:** custom `DomainException` with global `DomainHttpExceptionsFilter` and `AllHttpExceptionsFilter`
- **Rate limiting:** global `ThrottlerGuard` configurable via env, can be disabled for testing
- **Schema migrations:** the database schema is changed only through versioned TypeORM migrations; production applies them automatically before each rollout
- **Measured indexes:** every index serves a concrete API query and is backed by a seed script with an `EXPLAIN ANALYZE` benchmark (see [Database Indexes](#database-indexes))
- **Data integrity in the database:** foreign keys with `ON DELETE CASCADE` instead of application-side cleanup; no denormalized copies that can drift (see [Data Integrity & Concurrency](#data-integrity--concurrency))
- **Concurrency-safe counters:** like status updates run in a transaction with a row lock (`SELECT ... FOR UPDATE`), so parallel requests cannot double-count
- **Safe `LIKE` search:** user input in `searchNameTerm` / `searchLoginTerm` / `searchEmailTerm` is passed through `escapeLike()`, so `%` and `_` are matched literally

---

## API Reference

Base URL: `/api`

### Authentication

| Method | Endpoint                             | Auth                           | Description                        |
| ------ | ------------------------------------ | ------------------------------ | ---------------------------------- |
| `POST` | `/auth/registration`                 | —                              | Register a new user                |
| `POST` | `/auth/registration-confirmation`    | —                              | Confirm email with code            |
| `POST` | `/auth/registration-email-resending` | —                              | Resend confirmation email          |
| `POST` | `/auth/login`                        | Local (login/email + password) | Log in, receive JWT                |
| `POST` | `/auth/password-recovery`            | —                              | Request password recovery          |
| `POST` | `/auth/new-password`                 | —                              | Set new password via recovery code |
| `GET`  | `/auth/me`                           | Bearer JWT                     | Get current user info              |
| `POST` | `/auth/refresh-token`                | Cookie (refreshToken)          | Refresh access + refresh tokens    |
| `POST` | `/auth/logout`                       | Cookie (refreshToken)          | Logout, revoke refresh token       |

### Users (Admin)

| Method   | Endpoint            | Auth  | Description            |
| -------- | ------------------- | ----- | ---------------------- |
| `GET`    | `/sa/users`         | Basic | List users (paginated) |
| `POST`   | `/sa/users`         | Basic | Create a user          |
| `DELETE` | `/sa/users/:id`     | Basic | Delete a user          |
| `PUT`    | `/sa/users/:id/ban` | Basic | Ban or unban a user    |

### Blogs (Public)

| Method   | Endpoint                           | Auth       | Description                        |
| -------- | ---------------------------------- | ---------- | ---------------------------------- |
| `GET`    | `/blogs`                           | —          | List blogs (paginated, searchable) |
| `GET`    | `/blogs/:id`                       | —          | Get blog by ID                     |
| `GET`    | `/blogs/:blogId/posts`             | —          | List posts for a blog              |
| `GET`    | `/blogs/:blogId/posts/count`       | —          | Get posts count for a blog (extra) |
| `GET`    | `/blogs/:blogId/subscribers/count` | —          | Get subscribers count (extra)      |
| `POST`   | `/blogs/:blogId/subscribe`         | Bearer JWT | Subscribe to a blog (extra)        |
| `DELETE` | `/blogs/:blogId/subscribe`         | Bearer JWT | Unsubscribe from a blog (extra)    |

### Blogs (Admin)

| Method   | Endpoint                          | Auth  | Description                |
| -------- | --------------------------------- | ----- | -------------------------- |
| `GET`    | `/sa/blogs`                       | Basic | List all blogs (paginated) |
| `POST`   | `/sa/blogs`                       | Basic | Create a blog              |
| `PUT`    | `/sa/blogs/:id`                   | Basic | Update a blog              |
| `DELETE` | `/sa/blogs/:id`                   | Basic | Delete a blog              |
| `POST`   | `/sa/blogs/:blogId/posts`         | Basic | Create a post for a blog   |
| `GET`    | `/sa/blogs/:blogId/posts`         | Basic | List posts for a blog      |
| `PUT`    | `/sa/blogs/:blogId/posts/:postId` | Basic | Update a post for a blog   |
| `DELETE` | `/sa/blogs/:blogId/posts/:postId` | Basic | Delete a post for a blog   |

### Posts

| Method   | Endpoint                     | Auth       | Description              |
| -------- | ---------------------------- | ---------- | ------------------------ |
| `GET`    | `/posts`                     | —          | List posts (paginated)   |
| `POST`   | `/posts`                     | Basic      | Create a post            |
| `GET`    | `/posts/:id`                 | —          | Get post by ID           |
| `PUT`    | `/posts/:id`                 | Basic      | Update a post            |
| `DELETE` | `/posts/:id`                 | Basic      | Delete a post            |
| `PUT`    | `/posts/:postId/like-status` | Bearer JWT | Like / dislike / reset   |
| `GET`    | `/posts/:postId/comments`    | —          | List comments for a post |
| `POST`   | `/posts/:postId/comments`    | Bearer JWT | Create a comment         |

### Comments

| Method   | Endpoint                           | Auth       | Description            |
| -------- | ---------------------------------- | ---------- | ---------------------- |
| `GET`    | `/comments/:id`                    | —          | Get comment by ID      |
| `PUT`    | `/comments/:commentId`             | Bearer JWT | Update comment         |
| `DELETE` | `/comments/:commentId`             | Bearer JWT | Delete comment         |
| `PUT`    | `/comments/:commentId/like-status` | Bearer JWT | Like / dislike / reset |

### Security Devices

| Method   | Endpoint                      | Auth                  | Description                           |
| -------- | ----------------------------- | --------------------- | ------------------------------------- |
| `GET`    | `/security/devices`           | Cookie (refreshToken) | List all active sessions              |
| `DELETE` | `/security/devices`           | Cookie (refreshToken) | Terminate all sessions except current |
| `DELETE` | `/security/devices/:deviceId` | Cookie (refreshToken) | Terminate specified session           |

> Full interactive documentation available at `/swagger` (Swagger UI).

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL instance (local or cloud)
- Yarn

### Installation

```bash
git clone https://github.com/edward-tobilko/hometask_2-blogger_platform.git
cd hometask_2-blogger_platform
yarn install
```

### Environment Setup

Create `.env.development.local`:

```env
POSTGRES_URI=postgresql://<user>@localhost:5432/<dbname>

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRE_IN=10m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE_IN=30d

ADMIN_USER_NAME=admin
ADMIN_PASSWORD=qwerty

EMAIL=your@gmail.com
EMAIL_PASS=your_google_app_password

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_NAME=your_bot_username

IS_DISABLE_RATE_LIMIT=true
INCLUDE_TESTING_MODULE=true
IS_SWAGGER_ENABLED=true
IS_USER_AUTOMATICALLY_CONFIRMED=true
SEND_INTERNAL_SERVER_ERROR_DETAILS=true
```

### Apply Migrations

TypeORM `synchronize` is disabled, so the schema must be created by migrations before the first run:

```bash
yarn migration:run:dev
```

### Run

```bash
yarn dev       # Development with hot reload (port 5004)
yarn build     # Compile to dist/
```

---

## Database Migrations

The schema is versioned with **TypeORM migrations**. `synchronize: false` is set for every environment, so the application never changes the schema on its own — every change is an explicit, reviewable file in git.

| Path                    | Purpose                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `src/db/data-source.ts` | Standalone `DataSource` for the TypeORM CLI (Nest DI is not available) |
| `src/db/migrations/`    | Migration files (`<timestamp>-<Name>.ts`), each with `up()` / `down()` |
| `migrations` table      | Per-database journal of applied migrations                             |

### Commands

Each script sets `NODE_ENV` itself, which selects the target database (`.env.<NODE_ENV>.local` → `.env.<NODE_ENV>`). The `:dev` / `:test` suffix is the environment.

```bash
# Generate a migration from the diff between entities and the development database
yarn migration:generate src/db/migrations/AddPostsBlogIdIndex

# Preview the generated SQL without creating a file
yarn migration:generate src/db/migrations/AddPostsBlogIdIndex --dryrun -p

# Verify entities and database are in sync (no file is written; exits 1 if a migration is needed)
yarn migration:check:dev
yarn migration:check:test

# Create an empty migration for hand-written SQL
yarn migration:create src/db/migrations/RecalculatePostsLikesCounters

# Apply all pending migrations
yarn migration:run:dev
yarn migration:run:test

# Revert the last applied migration (runs its down())
yarn migration:revert:dev
yarn migration:revert:test

# Show applied [X] and pending [ ] migrations
yarn migration:show:dev
yarn migration:show:test
```

- `migration:generate` exists only for development — a migration is generated once and the same file is applied to every environment.
- There are no production scripts on purpose — production is migrated only by the release command (see [Migrations on Deploy](#migrations-on-deploy)).
- Path aliases (`src/...`) in entities are resolved by `tsconfig-paths`, registered for ts-node in `tsconfig.json`.
- An empty `POSTGRES_URI` exported in the shell overrides `.env` files (dotenv never overwrites existing variables) — run `unset POSTGRES_URI` if the CLI reports it as empty.

### Changing the Schema

1. Change the ORM entity
2. Preview with `--dryrun`, then `migration:generate` with a descriptive PascalCase name (`AddPostsBlogIdForeignKey`, `RenameLoginToUsername`)
3. Read the generated SQL — check for unexpected `DROP` statements or noise
4. `yarn migration:run:dev`, verify with `yarn migration:show:dev` and `yarn migration:check:dev`
5. `yarn migration:run:test`, then `yarn test:e2e`
6. Commit the entity and the migration together

**Removing a column (expand / contract).** Production migrations run before the new version replaces the old one, so for a few seconds the old code works against the new schema. A column is therefore dropped in two deploys:

1. Stop reading and writing the column in code (remove it from the entity) → deploy. The column still exists, nothing breaks.
2. Generate and deploy the `DROP COLUMN` migration. Its `down()` re-adds the column and backfills it from the source of truth where possible.

> A migration that exists only locally (not committed, applied only to your development database) may be reverted with `migration:revert:dev`, deleted and regenerated. Never edit, rename or delete a migration that has already been pushed or deployed — fix it with a new migration instead.

**Indexes TypeORM cannot describe.** `@Index` has no way to express an access method or operator class (`USING gin (... gin_trgm_ops)`). Such indexes are written by hand with `migration:create` and declared in the entity with `@Index('<name>', { synchronize: false })`, so `migration:generate` and `--check` do not try to recreate them as B-tree.

### Applied Migrations

| Migration                                                   | Change                                                                                                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `1791566062146-Baseline`                                    | Initial schema snapshot (all tables)                                                                                                           |
| `1791652410008-AddBlogsUpdatedAtDeletedAt`                  | `blogs` extends `BaseDBEntity`: adds `updated_at`, `deleted_at`                                                                                |
| `1792091015767-RecalculatePostsLikesCounters`               | Data migration: recalculates `posts.likes_count` and `dislikes_count` from `post_likes`                                                        |
| `1792265416547-AddCommentsPostIdIndex`                      | B-tree index on `comments (post_id)`                                                                                                           |
| `1792267343534-ReplaceCommentsPostIdIndexWithComposite`     | Replaces it with composite `comments (post_id, created_at)`                                                                                    |
| `1792339995669-AddPostsCompositeIndex`                      | Composite index `posts (blog_id, created_at)`                                                                                                  |
| `1792342458137-AddPostsCreatedAtIndex`                      | Index `posts (created_at)` for the global posts feed                                                                                           |
| `1792347023926-ReorderBlogSubscriptionsUniqueToBlogIdFirst` | Unique constraint reordered to `(blog_id, user_id)` so it also serves `WHERE blog_id = ?`                                                      |
| `1792350759439-AddSecurityDevicesSessionUserIdIndex`        | Index `security_devices_session (user_id)`                                                                                                     |
| `1792601199799-AddUserAccountsCodesIndexes`                 | Index on `confirmation_code`; partial indexes on `recovery_code`, `telegram_confirmation_code`                                                 |
| `1792611406549-AddBlogsNameTrigramIndex`                    | `CREATE EXTENSION pg_trgm` + GIN trigram index on `blogs (name)` (hand-written)                                                                |
| `1792960691202-MakeUserAccountsEmailUniqueAmongActive`      | Global `UNIQUE (email)` replaced by partial unique index `WHERE deleted_at IS NULL`                                                            |
| `1793389374666-AddUserAccountsLoginEmailTrigramIndexes`     | GIN trigram indexes on `user_accounts (login)` and `(email)` (hand-written)                                                                    |
| `1793477899500-AddPostLikesNewestLikesIndex`                | Partial index `post_likes (post_id, added_at) WHERE status = 'Like'`                                                                           |
| `1793557612339-AddBlogForeignKeys`                          | Removes orphans, then FKs `posts.blog_id`, `blog_subscriptions.blog_id` → `blogs` `ON DELETE CASCADE`                                          |
| `1793911418625-AddPostAndCommentForeignKeys`                | Removes orphans, then FKs `comments.post_id`, `post_likes.post_id` → `posts`, `comment_likes.comment_id` → `comments`, all `ON DELETE CASCADE` |
| `1793994079727-DropPostsBlogName`                           | Drops denormalized `posts.blog_name` (now read via `JOIN blogs`); `down()` backfills it from `blogs.name`                                      |
| `1794426843726-DropCommentLikesUserName`                    | Drops unused `comment_likes.user_name`; `down()` backfills it from `user_accounts.login`                                                       |

---

## Database Indexes

Each index below was added for a specific API query, after reproducing the problem on seeded data (`EXPLAIN ANALYZE` before and after). Timings are from a local PostgreSQL on tables with 0.1–2 million seeded rows.

| Index                                          | Definition                                                      | Serves                                                                     | Before → After   |
| ---------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------- |
| `IDX_06a1038b5b8f236c9ddb068af5`               | `comments (post_id, created_at)`                                | `GET /posts/:postId/comments`                                              | 64 ms → 0.06 ms  |
| `IDX_posts_blog_id_created_at`                 | `posts (blog_id, created_at)`                                   | `GET /blogs/:blogId/posts`                                                 | 80 ms → 0.1 ms   |
| `IDX_posts_created_at`                         | `posts (created_at)`                                            | `GET /posts` (global feed, no `Sort` node)                                 | 180 ms → 0.07 ms |
| `IDX_post_likes_post_id_added_at_like`         | `post_likes (post_id, added_at) WHERE status = 'Like'`          | `newestLikes` in `GET /posts`, `GET /posts/:id`                            | 22 ms → 0.1 ms   |
| `UQ_blog_subscriptions_blog_id_user_id`        | `UNIQUE blog_subscriptions (blog_id, user_id)`                  | `subscribersCount` / subscription status in `GET /blogs`, Telegram fan-out | —                |
| `IDX_security_devices_session_user_id`         | `security_devices_session (user_id)`                            | `GET /security/devices`, terminate sessions, session revocation on ban     | 50 ms → 0.08 ms  |
| `IDX_user_accounts_confirmation_code`          | `user_accounts (confirmation_code)`                             | `POST /auth/registration-confirmation`                                     | 60 ms → 0.06 ms  |
| `IDX_user_accounts_recovery_code`              | `user_accounts (recovery_code) WHERE recovery_code IS NOT NULL` | `POST /auth/new-password`                                                  | 60 ms → 0.05 ms  |
| `IDX_user_accounts_telegram_confirmation_code` | `... (telegram_confirmation_code) WHERE ... IS NOT NULL`        | Telegram webhook (bot activation code)                                     | 55 ms → 0.07 ms  |
| `IDX_user_accounts_email_active`               | `UNIQUE user_accounts (email) WHERE deleted_at IS NULL`         | Integrity: email is unique among active users, reusable after soft delete  | —                |
| `IDX_blogs_name_trgm`                          | `blogs USING gin (name gin_trgm_ops)`                           | `GET /blogs?searchNameTerm=` (`ILIKE '%term%'`)                            | 95 ms → 1.5 ms   |
| `IDX_user_accounts_login_trgm` / `_email_trgm` | `user_accounts USING gin (login / email gin_trgm_ops)`          | `GET /sa/users?searchLoginTerm=&searchEmailTerm=` (`BitmapOr`)             | 145 ms → 4.2 ms  |

### Trade-offs Observed

- **Write cost:** a GIN index makes inserts slower — 100k rows into `blogs` took ~2105 ms with `IDX_blogs_name_trgm` vs ~745 ms without it.
- **Partial indexes** (`WHERE ... IS NOT NULL`, `WHERE status = 'Like'`) index only the rows the query can match, so sparse columns stay small.
- **Selectivity matters:** for a term that matches most of the table (e.g. `seed` on every user), the planner correctly keeps `Parallel Seq Scan`; forcing the index with `SET enable_seqscan = off` was ~1.5× slower.
- **Trigram limits:** `pg_trgm` needs at least 3 characters — a 2-character search term cannot use the GIN index at all.
- **`ORDER BY ... LIMIT`:** a composite index whose last column is the sort key returns rows already ordered (`Index Scan Backward`), so the `Sort` node disappears and the scan stops after `LIMIT` rows.

### Benchmark Scripts

Seed and benchmark scripts live in `src/core/scripts/` and are run manually against the **development** database (never production):

| Script                              | Seeds                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `create-seed-comments.script.sql`   | 1M comments across 1,000 posts                                                                   |
| `create-seed-posts.script.sql`      | 2M posts across 2,000 seeded blogs (run the blogs seed first — `posts.blog_id` is a foreign key) |
| `create-seed-post-likes.script.sql` | 100k likes on one post (80% Like / 20% Dislike)                                                  |
| `create-seed-sessions.script.sql`   | 1M sessions for 200k users                                                                       |
| `create-seed-users.script.sql`      | 1M users (sparse codes, md5 emails)                                                              |
| `create-seed-blogs.script.sql`      | 1M blogs with md5 names                                                                          |
| `delete-seed.script.sql`            | Removes all seeded rows and runs `VACUUM ANALYSE`                                                |

Workflow: seed → `ANALYSE <table>` → `EXPLAIN ANALYSE` the exact query the repository sends → add the index via migration → re-run the same query and record both timings in the script.

---

## Data Integrity & Concurrency

### Foreign Keys with Cascade Delete

Deleting a parent row removes its dependents in the same statement — no orphaned rows and no cleanup code in use cases.

| Child column                 | References    | On delete |
| ---------------------------- | ------------- | --------- |
| `posts.blog_id`              | `blogs.id`    | `CASCADE` |
| `blog_subscriptions.blog_id` | `blogs.id`    | `CASCADE` |
| `comments.post_id`           | `posts.id`    | `CASCADE` |
| `post_likes.post_id`         | `posts.id`    | `CASCADE` |
| `comment_likes.comment_id`   | `comments.id` | `CASCADE` |

Deleting a blog therefore removes its posts, their comments and all related likes. Covered by e2e tests (`DELETE /sa/blogs/:id`, `DELETE /posts/:id`).

### No Drifting Copies

- `posts.blog_name` was a copy of `blogs.name` and went stale after a blog rename. It was dropped; `blogName` is now read via `JOIN blogs` (including sort by `blogName`).
- `comment_likes.user_name` was written on every like but never read. It was dropped together with the extra cross-module user lookup it required.

### Like Status Under Concurrent Requests

`likes_count` / `dislikes_count` are denormalized counters on `posts` and `comments`. Updating them is a read-modify-write: read the user's previous status → upsert the like → adjust the counters. Without coordination, parallel requests from one user (double click, network retries) all read the same previous status and each apply their delta — one row in `*_likes`, but the counter is off.

Both `UpdatePostLikeStatusUseCase` and `UpdateCommentLikeStatusUseCase` run inside `dataSource.transaction()`:

1. `SELECT ... FOR UPDATE` on the parent row (post / comment) — concurrent updates of the same item queue up;
2. read the previous status, upsert the like and update the counters through the transaction's `EntityManager`;
3. `COMMIT` releases the lock; any thrown `DomainException` causes `ROLLBACK` and is returned unchanged (e.g. `404`).

E2E tests fire 10 parallel requests from one user and assert that the user's vote is counted exactly once.

---

## Testing

### Setup

Create `.env.testing.local` with a separate test database:

```env
POSTGRES_URI=postgresql://<user>@localhost:5432/<dbname>_testing

ACCESS_TOKEN_SECRET=secretOrKey_forTest
REFRESH_TOKEN_SECRET=secretOrKey_forTest

ADMIN_USER_NAME=admin
ADMIN_PASSWORD=qwerty

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_NAME=your_bot_username

IS_DISABLE_RATE_LIMIT=true
IS_USER_AUTOMATICALLY_CONFIRMED=false
INCLUDE_TESTING_MODULE=true
```

Create the schema in the test database (and re-run after pulling new migrations):

```bash
yarn migration:run:test
```

### Commands

```bash
yarn test:unit         # Unit tests only (parallel)
yarn test:e2e          # E2E tests only (sequential, real DB)

# Run a specific file
yarn test:unit -- --testPathPatterns=blog
yarn test:e2e  -- --testPathPatterns=auth
```

### Test Structure

```
test/
├── e2e/
│   ├── e2e-auth/
│   ├── e2e-blogs/
│   ├── e2e-posts/
│   ├── e2e-comments/
│   ├── e2e-security-devices/
│   └── e2e-users/
├── helpers/     # Test managers, init helpers
├── mock/        # Email service mock
├── unit/        # Unit tests (view-dto mapping, entity domain rules, config, utils)
└── utils/       # Shared test utilities (BadRequestError, expectErrorField)
```

E2E tests use **Test Managers** (`BlogTestManager`, `UserTestManager`, etc.) for clean test data setup and reusable assertions via Supertest.

---

## Environment Variables Reference

| Variable                             | Description                         | Example                     |
| ------------------------------------ | ----------------------------------- | --------------------------- |
| `POSTGRES_URI`                       | PostgreSQL connection string        | `postgresql://user@host/db` |
| `ACCESS_TOKEN_SECRET`                | JWT access token secret             | `supersecret`               |
| `ACCESS_TOKEN_EXPIRE_IN`             | Access token TTL                    | `10m`                       |
| `REFRESH_TOKEN_SECRET`               | JWT refresh token secret            | `anothersecret`             |
| `REFRESH_TOKEN_EXPIRE_IN`            | Refresh token TTL                   | `30d`                       |
| `ADMIN_USER_NAME`                    | Basic auth username                 | `admin`                     |
| `ADMIN_PASSWORD`                     | Basic auth password                 | `qwerty`                    |
| `EMAIL`                              | Sender email address                | `bot@gmail.com`             |
| `EMAIL_PASS`                         | Google App Password                 | `xxxx xxxx xxxx xxxx`       |
| `TELEGRAM_BOT_TOKEN`                 | Telegram bot token                  | `123456:AAF...`             |
| `TELEGRAM_BOT_NAME`                  | Telegram bot username               | `my_bot`                    |
| `PORT`                               | Server port                         | `5004`                      |
| `IS_DISABLE_RATE_LIMIT`              | Disable IP rate limiting            | `true`                      |
| `INCLUDE_TESTING_MODULE`             | Expose `/testing/all-data` endpoint | `true`                      |
| `IS_SWAGGER_ENABLED`                 | Enable Swagger UI                   | `true`                      |
| `IS_USER_AUTOMATICALLY_CONFIRMED`    | Skip email confirmation (dev only)  | `true`                      |
| `SEND_INTERNAL_SERVER_ERROR_DETAILS` | Expose error details in response    | `false`                     |

---

## Deployment

The app is containerized with Docker and deployed to **Fly.io** with **Neon** as the PostgreSQL cloud provider.

```bash
yarn fly   # fly deploy
```

Secrets are managed via Fly.io (never stored in `.env.production`):

```bash
fly secrets set POSTGRES_URI="postgresql://..." \
  ACCESS_TOKEN_SECRET="..." \
  REFRESH_TOKEN_SECRET="..." \
  TELEGRAM_BOT_TOKEN="..."
```

Docker image is based on `node:20.20.0-slim`. The app listens on port `8080` in production.

### Migrations on Deploy

Pending migrations are applied by a Fly.io **release command** (`fly.toml`), which runs in a temporary machine from the new image **before** traffic is switched:

```toml
[deploy]
  release_command = "node ./node_modules/typeorm/cli.js migration:run -d dist/db/data-source.js"
```

- The production image contains only `dist/`, so the compiled data source and the plain JS CLI are used (no ts-node).
- If a migration fails, the deployment is aborted and the previous version keeps serving traffic.
- Re-running is safe: already applied migrations are skipped.

Check the production migration journal without exposing the database URI locally:

```bash
fly ssh console -C "node ./node_modules/typeorm/cli.js migration:show -d dist/db/data-source.js"
```

---

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/               # TypeORM, Config, Throttler modules
├── core/                 # Shared: decorators, exceptions, pipes, constants, DTOs, enums, utils
│   └── scripts/          # SQL seed + EXPLAIN ANALYZE benchmark scripts (dev only)
├── db/
│   ├── data-source.ts    # DataSource for the TypeORM CLI
│   └── migrations/       # Versioned schema migrations
├── modules/
│   ├── bloggers-platform/  # Blogs, posts, comments, likes, subscriptions (PostgreSQL/TypeORM)
│   ├── user-accounts/      # Users, auth, security-devices, ban/unban (PostgreSQL/TypeORM)
│   │   └── infrastructure/
│   │       └── sql/        # TypeORM ORM entities + repositories
│   ├── integrations/       # Telegram notifications
│   └── testing/            # Testing controller (/testing/all-data)
├── setup/                # App bootstrap: pipes, swagger, global prefix
└── init-app.module.ts    # Dynamic module factory (reads CoreConfig)
```

---

## Extra Logic over the Basic API

### 1. Blog Subscriptions

Users can subscribe and unsubscribe from blogs. Each blog response includes:

- `subscribersCount` — total number of active subscribers
- `currentUserSubscriptionStatus` — `Subscribed` / `Unsubscribed` / `None` for the requesting user

Implemented via SQL subqueries in TypeORM QueryBuilder to avoid N+1 queries. Endpoints listed in the [Blogs (Public)](#blogs-public) section above.

---

### 2. Telegram Notifications

Users can link their Telegram account to receive notifications when a new post is published in a subscribed blog.

- Webhook-based integration via `TelegramAdapter`
- `chatId` stored as a flat column on `UserAccountOrmEntity`
- Notifications sent via domain event `PostCreatedEvent` → `PostCreatedEventHandler`
- Failures are isolated per user — one failed send does not block others

| Method | Endpoint                         | Auth       | Description                            |
| ------ | -------------------------------- | ---------- | -------------------------------------- |
| `POST` | `/integrations/telegram/webhook` | —          | Webhook receiver for Telegram Bot API  |
| `POST` | `/integrations/telegram/auth`    | Bearer JWT | Get personal deep-link to activate bot |

---

### 3. User Ban / Unban

Admins can ban users with a configurable duration. Banned users cannot log in and their comments are hidden.

- `BanDuration` enum: `MINUTE_1`, `HOURS_12`, `DAYS_7`, `PERMANENT`
- Ban state stored in a separate `users_ban_info` table (one-to-one with `user_accounts`); `ban_expires_at` is `timestamptz | null` (`null` = permanent)
- Ban state checked in `AuthService.validateUser` on every login attempt
- Ban state also checked in `JwtStrategy.validate()` — banned users are immediately rejected on every authenticated request, even with a valid access token
- Ban triggers `UserBannedEvent` → cascades: session revocation + comment visibility hidden
- Unban triggers `UserUnBannedEvent` → comments restored
- A hidden comment behaves as non-existent for other users: `GET /comments/:id` and `PUT /comments/:id/like-status` both return `404`, so likes cannot be recorded while it is hidden

| Method | Endpoint            | Auth  | Description                                         |
| ------ | ------------------- | ----- | --------------------------------------------------- |
| `PUT`  | `/sa/users/:id/ban` | Basic | Ban (`isBanned: true`) or unban (`isBanned: false`) |
