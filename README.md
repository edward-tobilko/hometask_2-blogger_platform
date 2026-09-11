# Blogger Platform API

A production-ready REST API for a blogging platform featuring full user account management, JWT authentication, blogs, posts, comments and security devices. Built with **NestJS**, **TypeScript**, **PostgreSQL** and **TypeORM**, following **Domain-Driven Design** principles.

**Live Demo:** https://hometask-2-blogger-platform.fly.dev/api

---

## Tech Stack

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| Framework      | NestJS 11, Express 5                              |
| Language       | TypeScript 5.7                                    |
| Database       | PostgreSQL + TypeORM (all modules)                |
| Authentication | JWT (access + refresh tokens), Passport.js        |
| Validation     | class-validator, class-transformer                |
| API Docs       | Swagger / OpenAPI (@nestjs/swagger)               |
| Email          | Nodemailer                                        |
| Testing        | Jest, Supertest                                   |
| Deployment     | Fly.io, Docker, Neon (PostgreSQL cloud)           |

---

## Architecture

The project follows **Domain-Driven Design (DDD)** with a **CQRS** pattern for separating reads and writes.

### Module Structure

Each domain module is split into four layers:

```
<module>/
├── api/             # Controllers, Decorators, Constraints and Input/View DTOs
├── application/     # UseCases (writes), Queries (reads), Event Handlers
├── domain/          # Entities, Events and DTOs
└── infrastructure/
    └── sql/         # TypeORM repositories + ORM entities
```

### Modules

- **`bloggers-platform/`** — blogs, posts, comments, likes, subscriptions (PostgreSQL/TypeORM)
- **`user-accounts/`** — users, auth, security-devices, guards (PostgreSQL/TypeORM)
- **`integrations/`** — Telegram notifications
- **`core/`** — shared decorators, exceptions, pipes, constants, DTOs, enums and utils
- **`config/`** — TypeORM module, Config module, Throttler module

### Key Patterns

- **CQRS:** Controllers dispatch commands/queries via `CommandBus`/`QueryBus`. No business logic in controllers.
- **Domain Events:** mutations publish events via `EventBus`. Handlers wrapped in try/catch to prevent unhandled rejections.
- **External Repositories:** cross-module reads use `*ExternalRepository` (read-only). Direct imports between modules are forbidden.
- **Exception handling:** custom `DomainException` with global `DomainHttpExceptionsFilter` and `AllHttpExceptionsFilter`
- **Rate limiting:** global `ThrottlerGuard` configurable via env, can be disabled for testing

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

| Method   | Endpoint               | Auth  | Description                    |
| -------- | ---------------------- | ----- | ------------------------------ |
| `GET`    | `/sa/users`            | Basic | List users (paginated)         |
| `POST`   | `/sa/users`            | Basic | Create a user                  |
| `DELETE` | `/sa/users/:id`        | Basic | Delete a user                  |
| `PUT`    | `/sa/users/:id/ban`    | Basic | Ban or unban a user            |

### Blogs

| Method   | Endpoint                      | Auth  | Description                        |
| -------- | ----------------------------- | ----- | ---------------------------------- |
| `GET`    | `/blogs`                      | —     | List blogs (paginated, searchable) |
| `GET`    | `/blogs/:id`                  | —     | Get blog by ID                     |
| `GET`    | `/blogs/:blogId/posts`        | —     | List posts for a blog              |
| `POST`   | `/sa/blogs`                   | Basic | Create a blog                      |
| `PUT`    | `/sa/blogs/:id`               | Basic | Update a blog                      |
| `DELETE` | `/sa/blogs/:id`               | Basic | Delete a blog                      |
| `POST`   | `/sa/blogs/:blogId/posts`     | Basic | Create a post for a blog           |

### Posts

| Method   | Endpoint                     | Auth       | Description                     |
| -------- | ---------------------------- | ---------- | ------------------------------- |
| `GET`    | `/posts`                     | —          | List posts (paginated)          |
| `GET`    | `/posts/:id`                 | —          | Get post by ID                  |
| `PUT`    | `/posts/:id`                 | Basic      | Update a post                   |
| `DELETE` | `/posts/:id`                 | Basic      | Delete a post                   |
| `PUT`    | `/posts/:postId/like-status` | Bearer JWT | Like / dislike / reset          |
| `GET`    | `/posts/:postId/comments`    | —          | List comments for a post        |
| `POST`   | `/posts/:postId/comments`    | Bearer JWT | Create a comment                |

### Comments

| Method   | Endpoint                           | Auth       | Description                 |
| -------- | ---------------------------------- | ---------- | --------------------------- |
| `GET`    | `/comments/:id`                    | —          | Get comment by ID           |
| `PUT`    | `/comments/:commentId`             | Bearer JWT | Update comment              |
| `DELETE` | `/comments/:commentId`             | Bearer JWT | Delete comment              |
| `PUT`    | `/comments/:commentId/like-status` | Bearer JWT | Like / dislike / reset      |

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
REFRESH_TOKEN_COOKIE_MAX_AGE=86400000

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
DB_AUTO_SYNC=true
```

### Run

```bash
yarn dev       # Development with hot reload (port 5004)
yarn build     # Compile to dist/
```

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
├── unit/        # Unit tests (view-dto mapping, config)
└── utils/       # Shared test utilities (BadRequestError, expectErrorField)
```

E2E tests use **Test Managers** (`BlogTestManager`, `UserTestManager`, etc.) for clean test data setup and reusable assertions via Supertest.

---

## Environment Variables Reference

| Variable                          | Description                          | Example                       |
| --------------------------------- | ------------------------------------ | ----------------------------- |
| `POSTGRES_URI`                    | PostgreSQL connection string         | `postgresql://user@host/db`   |
| `DB_AUTO_SYNC`                    | TypeORM auto-sync schema (dev only)  | `true`                        |
| `ACCESS_TOKEN_SECRET`             | JWT access token secret              | `supersecret`                 |
| `ACCESS_TOKEN_EXPIRE_IN`          | Access token TTL                     | `10m`                         |
| `REFRESH_TOKEN_SECRET`            | JWT refresh token secret             | `anothersecret`               |
| `REFRESH_TOKEN_EXPIRE_IN`         | Refresh token TTL                    | `30d`                         |
| `REFRESH_TOKEN_COOKIE_MAX_AGE`    | Cookie max age (ms)                  | `86400000`                    |
| `ADMIN_USER_NAME`                 | Basic auth username                  | `admin`                       |
| `ADMIN_PASSWORD`                  | Basic auth password                  | `qwerty`                      |
| `EMAIL`                           | Sender email address                 | `bot@gmail.com`               |
| `EMAIL_PASS`                      | Google App Password                  | `xxxx xxxx xxxx xxxx`         |
| `TELEGRAM_BOT_TOKEN`              | Telegram bot token                   | `123456:AAF...`               |
| `TELEGRAM_BOT_NAME`               | Telegram bot username                | `my_bot`                      |
| `PORT`                            | Server port                          | `5004`                        |
| `IS_DISABLE_RATE_LIMIT`           | Disable IP rate limiting             | `true`                        |
| `INCLUDE_TESTING_MODULE`          | Expose `/testing/all-data` endpoint  | `true`                        |
| `IS_SWAGGER_ENABLED`              | Enable Swagger UI                    | `true`                        |
| `IS_USER_AUTOMATICALLY_CONFIRMED` | Skip email confirmation (dev only)   | `true`                        |
| `SEND_INTERNAL_SERVER_ERROR_DETAILS` | Expose error details in response  | `false`                       |

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

---

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/               # TypeORM, Config, Throttler modules
├── core/                 # Shared: decorators, exceptions, pipes, constants, DTOs, enums, utils
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

Implemented via SQL subqueries in TypeORM QueryBuilder to avoid N+1 queries.

| Method   | Endpoint                   | Auth       | Description             |
| -------- | -------------------------- | ---------- | ----------------------- |
| `POST`   | `/blogs/:blogId/subscribe` | Bearer JWT | Subscribe to a blog     |
| `DELETE` | `/blogs/:blogId/subscribe` | Bearer JWT | Unsubscribe from a blog |

---

### 2. Telegram Notifications

Users can link their Telegram account to receive notifications when a new post is published in a subscribed blog.

- Webhook-based integration via `TelegramAdapter`
- `chatId` stored as a flat column on `UserAccountOrmEntity`
- Notifications sent via domain event `PostCreatedEvent` → `PostCreatedEventHandler`
- Failures are isolated per user — one failed send does not block others

| Method | Endpoint                               | Auth       | Description                            |
| ------ | -------------------------------------- | ---------- | -------------------------------------- |
| `POST` | `/integrations/telegram/webhook`       | —          | Webhook receiver for Telegram Bot API  |
| `GET`  | `/integrations/telegram/auth-bot-link` | Bearer JWT | Get personal deep-link to activate bot |

---

### 3. User Ban / Unban

Admins can ban users with a configurable duration. Banned users cannot log in and their comments are hidden.

- `BanDuration` enum: `HOURS_12`, `DAYS_7`, `PERMANENT`
- `banExpiresAt` calculated and stored as `timestamptz | null` in `user_accounts` table
- Ban state checked in `AuthService.validateUser` on every login attempt
- Ban triggers `UserBannedEvent` → cascades: session revocation + comment visibility hidden
- Unban triggers `UserUnBannedEvent` → comments restored

| Method | Endpoint            | Auth  | Description                                          |
| ------ | ------------------- | ----- | ---------------------------------------------------- |
| `PUT`  | `/sa/users/:id/ban` | Basic | Ban (`isBanned: true`) or unban (`isBanned: false`)  |
