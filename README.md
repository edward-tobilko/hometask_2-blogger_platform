# Blogger Platform API

A production-ready REST API for a blogging platform featuring full user account management, JWT authentication, blogs, posts, comments and security devices. Built with **NestJS**, **TypeScript**, and **MongoDB**, following **Domain-Driven Design** principles.

**Live Demo:** https://hometask-2-blogger-platform.fly.dev/api

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Framework      | NestJS 11, Express 5                       |
| Language       | TypeScript 5.7                             |
| Database       | MongoDB + Mongoose 9                       |
| Authentication | JWT (access + refresh tokens), Passport.js |
| Validation     | class-validator, class-transformer         |
| API Docs       | Swagger / OpenAPI (@nestjs/swagger)        |
| Email          | Nodemailer                                 |
| Testing        | Jest, Supertest                            |
| Deployment     | Fly.io, Docker                             |

---

## Architecture

The project follows **Domain-Driven Design (DDD)** with a **CQRS** pattern for separating reads and writes.

### Module Structure

Each domain module is split into four layers:

```
<module>/
├── api/             # Controllers, Decorators, Constraints and Input/View DTOs
├── application/     # UseCases / Services (writes), Queries (reads), Event Handlers
├── config/          # ConfigService (.env logics)
├── domain/          # Entities, Events and DTOs
└── infrastructure/  # Repositories, External services and External query
```

### Modules

- **`bloggers-platform/`** — blogs, posts, comments
- **`user-accounts/`** — users, auth, securityDevices, guards
- **`core/`** — shared decorators, exceptions, pipes, constants, DTOs, Enums and Utils
- **`config/`** — Mongoose module, Config module (env configuration), Throttler module (ttl / limit)

### Key Patterns

- **CQRS:** write operations use `*Service` + `*Repository`; reads use `*QueryService` + `*QueryRepository`
- **Exception handling:** custom `DomainException` class with global `DomainHttpExceptionsFilter` and `AllHttpExceptionsFilter`
- **Rate limiting:** global `ThrottlerGuard` configurable via env, can be disabled for testing
- **Validation:** global `ValidationPipe` with custom error formatting and recursive nested field support

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

| Method   | Endpoint     | Auth  | Description            |
| -------- | ------------ | ----- | ---------------------- |
| `GET`    | `/users`     | Basic | List users (paginated) |
| `POST`   | `/users`     | Basic | Create a user          |
| `DELETE` | `/users/:id` | Basic | Delete a user          |

### Blogs

| Method   | Endpoint               | Description                        |
| -------- | ---------------------- | ---------------------------------- |
| `GET`    | `/blogs`               | List blogs (paginated, searchable) |
| `POST`   | `/blogs`               | Create a blog                      |
| `GET`    | `/blogs/:id`           | Get blog by ID                     |
| `PUT`    | `/blogs/:id`           | Update a blog                      |
| `DELETE` | `/blogs/:id`           | Delete a blog                      |
| `GET`    | `/blogs/:blogId/posts` | List posts for a blog              |
| `POST`   | `/blogs/:blogId/posts` | Create a post for a blog           |

### Posts

| Method   | Endpoint                     | Description                                        |
| -------- | ---------------------------- | -------------------------------------------------- |
| `PUT`    | `/posts/:postId/like-status` | Make like / unlike / dislike / undislike operation |
| `GET`    | `/posts`                     | List posts (paginated)                             |
| `POST`   | `/posts`                     | Create a post                                      |
| `GET`    | `/posts/:id`                 | Get post by ID                                     |
| `PUT`    | `/posts/:id`                 | Update a post                                      |
| `DELETE` | `/posts/:id`                 | Delete a post                                      |
| `GET`    | `/posts/:postId/comments`    | List comments for a post                           |
| `POST`   | `/posts/:postId/comments`    | Create a comment (requires JWT)                    |

### Comments

| Method   | Endpoint                           | Description                                        |
| -------- | ---------------------------------- | -------------------------------------------------- |
| `PUT`    | `/comments/:commentId/like-status` | Make like / unlike / dislike / undislike operation |
| `PUT`    | `/comments/:commentId`             | Update existing comment by id with input model     |
| `DELETE` | `/comments/:commentId`             | Delete comment specified by id                     |
| `GET`    | `/comments/:id`                    | Get comment by ID                                  |

### Security Devices

| Method   | Endpoint                      | Auth                  | Description                           |
| -------- | ----------------------------- | --------------------- | ------------------------------------- |
| `GET`    | `/security/devices`           | Cookie (refreshToken) | List all active sessions              |
| `DELETE` | `/security/devices`           | Cookie (refreshToken) | Terminate all sessions except current |
| `DELETE` | `/security/devices/:deviceId` | Cookie (refreshToken) | Terminate specified session           |

> Full interactive documentation available at `/api` (Swagger UI).

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance
- Yarn

### Installation

```bash
git clone https://github.com/edward-tobilko/hometask_2-blogger_platform.git
cd blogger-platform
yarn install
```

### Environment Setup

Create `.env.development.local`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
DB_NAME=blogger_platform_dev

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRE_IN=10s
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE_IN=20s
REFRESH_TOKEN_COOKIE_MAX_AGE=86400000

ADMIN_USER_NAME=admin
ADMIN_PASSWORD=qwerty

EMAIL=your@gmail.com
EMAIL_PASS=your_google_app_password

IS_DISABLE_RATE_LIMIT=true
INCLUDE_TESTING_MODULE=true
IS_SWAGGER_ENABLED=true
IS_USER_AUTOMATICALLY_CONFIRMED=true
SEND_INTERNAL_SERVER_ERROR_DETAILS=true
```

### Run

```bash
yarn dev       # Development with hot reload (port 3000)
yarn build     # Compile to dist/
```

---

## Testing

### Setup

Create `.env.testing` with a separate test database:

```env
PORT=9100
MONGO_URI=mongodb://localhost:27017/test-db
NODE_ENV=testing
DB_NAME=test-db

DB_AUTO_SYNC=true
INCLUDE_TESTING_MODULE=true
IS_SWAGGER_ENABLED=false
IS_USER_AUTOMATICALLY_CONFIRMED=false
SEND_INTERNAL_SERVER_ERROR_DETAILS=false
IS_DISABLE_RATE_LIMIT=true

ADMIN_USER_NAME=admin
ADMIN_PASSWORD=qwerty

ACCESS_TOKEN_SECRET=secretOrKey_forTest
REFRESH_TOKEN_SECRET=secretOrKey_forTest

TTL_RATE_LIMIT=10000
COUNT_RATE_LIMIT=1000

ACCESS_TOKEN_EXPIRE_IN=10m
REFRESH_TOKEN_EXPIRE_IN=30d
REFRESH_TOKEN_COOKIE_MAX_AGE=86400000
```

### Commands

```bash
yarn test:unit         # Unit tests only (parallel)
yarn test:e2e          # E2E tests only (sequential, real DB)

# Run a specific file
yarn test:unit -- --testPathPattern=blog
yarn test:e2e  -- --testPathPattern=auth
```

### Test Structure

```
test/
├── unit/
│   ├── unit-app/
│   └── unit-blogs/
│   └── unit-core/
├── e2e/
│   ├── e2e-auth/
│   ├── e2e-blogs/
│   ├── e2e-posts/
│   ├── e2e-comments/
│   ├── e2e-security-devices/
│   └── e2e-users/
└── helpers/            # Test managers, init helpers, mock data
└── mock/            # Email service mock data
```

E2E tests use **Test Managers** (e.g. `BlogsTestManager`, `UsersTestManager`) for clean test data setup and reusable assertions via Supertest.

---

## Environment Variables Reference

| Variable                  | Description                | Example                  |
| ------------------------- | -------------------------- | ------------------------ |
| `MONGO_URI`               | MongoDB connection string  | `mongodb+srv://...`      |
| `DB_NAME`                 | Database name              | `blogger_platform_dev`   |
| `ACCESS_TOKEN_SECRET`     | JWT access token secret    | `supersecret`            |
| `ACCESS_TOKEN_EXPIRE_IN`  | Access token TTL           | `10m`                    |
| `REFRESH_TOKEN_SECRET`    | JWT refresh token secret   | `anothersecret`          |
| `REFRESH_TOKEN_EXPIRE_IN` | Refresh token TTL          | `30d`                    |
| `ADMIN_USER_NAME`         | Basic auth username        | `admin`                  |
| `ADMIN_PASSWORD`          | Basic auth password        | `qwerty`                 |
| `EMAIL`                   | Sender email address       | `bot@gmail.com`          |
| `EMAIL_PASS`              | Google App Password        | `xxxx xxxx xxxx xxxx`    |
| `PORT`                    | Server port                | `3000` (default: `8080`) |
| `IS_DISABLE_RATE_LIMIT`   | Disable throttling         | `true`                   |
| `INCLUDE_TESTING_MODULE`  | Expose `/testing/all-data` | `true`                   |

---

## Deployment

The app is containerized with Docker and deployed to **Fly.io**.

```bash
yarn fly   # fly deploy
```

Docker image is based on `node:20.20.0-slim`. The app listens on port `8080` in production.

Secrets are managed via `fly secrets set KEY=value`.

---

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/                  # Mongoose module, Config module (env configuration), Throttler module (ttl / limit)
├── core/                    # Shared: decorators, exceptions, pipes, constants, DTOs, Enums and Utils
├── modules/
│   ├── bloggers-platform/   # Blogs, posts, comments (DDD modules)
│   └── user-accounts/       # Users, auth, guards, securityDevices
├── setup/                   # App bootstrap: pipes, swagger, global prefix
└── testing/                 # Testing controller (/testing/all-data)
```

## Extra Logic over the Basic API

Three production-oriented features implemented on top of the core API:

### 1. Blog Subscriptions

Users can subscribe and unsubscribe from blogs. Each blog response includes:

- `subscribersCount` — total number of active subscribers
- `currentUserSubscriptionStatus` — `Subscribed` / `Unsubscribed` for the authenticated user

Implemented via MongoDB aggregation (`$lookup`) to avoid N+1 queries.

**Endpoints:**

| Method   | Endpoint                      | Auth       | Description             |
| -------- | ----------------------------- | ---------- | ----------------------- |
| `POST`   | `/blogs/:blogId/subscription` | Bearer JWT | Subscribe to a blog     |
| `DELETE` | `/blogs/:blogId/subscription` | Bearer JWT | Unsubscribe from a blog |

---

### 2. Telegram Notifications

Users can link their Telegram account to receive notifications when a new post is published in a subscribed blog.

- Webhook-based integration via `TelegramAdapter`
- `chatId` is stored in `telegramNotificationsInfo` Value Object on `UserAccount`
- Notifications are sent via domain event `PostCreatedEvent` → `PostCreatedEventHandler`
- Failures are isolated per user — one failed send does not block the rest

**Required env variables:**

````env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_NAME=your_bot_username

Endpoints:

┌────────┬──────────────────────────────────────┬────────────┬────────────────────────────────────────┐
│ Method │               Endpoint               │    Auth    │              Description               │
├────────┼──────────────────────────────────────┼────────────┼────────────────────────────────────────┤
│ GET    │ /integrations/telegram/webhook       │ —          │ Webhook receiver for Telegram Bot API  │
├────────┼──────────────────────────────────────┼────────────┼────────────────────────────────────────┤
│ GET    │ /integrations/telegram/auth-bot-link │ Bearer JWT │ Get personal deep-link to activate bot │
└────────┴──────────────────────────────────────┴────────────┴────────────────────────────────────────┘

---
3. User Ban / Unban

Admins can ban users with a configurable duration. Banned users cannot log in.

- BanDuration enum: HOURS_12, DAYS_7, PERMANENT
- banExpiresAt stored as Date | null in BanInfo Value Object
- Ban state is checked in JwtStrategy on every authenticated request
- Ban/Unban triggers a domain event with cascading effects (session revocation)
- MongoDB migrations via migrate-mongo for existing documents

Endpoints:

┌────────┬──────────────────┬───────┬──────────────┐
│ Method │     Endpoint     │ Auth  │ Description  │
├────────┼──────────────────┼───────┼──────────────┤
│ PUT    │ /users/:id/ban   │ Basic │ Ban a user   │
├────────┼──────────────────┼───────┼──────────────┤
│ PUT    │ /users/:id/unban │ Basic │ Unban a user │
├────────┼──────────────────┼───────┼──────────────┤
│ ```    │                  │       │              │
└────────┴──────────────────┴───────┴──────────────┘

````
