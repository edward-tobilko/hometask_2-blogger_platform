# Blogger Platform API

A production-ready REST API for a blogging platform featuring full user account management, JWT authentication, blogs, posts, and comments. Built with **NestJS**, **TypeScript**, and **MongoDB**, following **Domain-Driven Design** principles.

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
├── api/             # Controllers + Input/View DTOs
├── application/     # Services (writes) + QueryServices (reads)
├── domain/          # Entities, Value Objects
└── infrastructure/  # Repositories, Mongoose schemas, External services
```

### Modules

- **`bloggers-platform/`** — blogs, posts, comments
- **`user-accounts/`** — users, auth, guards, email
- **`core/`** — shared decorators, exceptions, pipes, constants
- **`config/`** — MongoDB, throttler, env configuration

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
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
DB_NAME=blogger_platform_dev

AT_SECRET=your_access_token_secret
AT_TIME=5m
RT_SECRET=your_refresh_token_secret
RT_TIME=7d

ADMIN_USERNAME=admin
ADMIN_PASSWORD=qwerty

EMAIL=your@gmail.com
EMAIL_PASS=your_google_app_password

DISABLE_RATE_LIMIT=true
INCLUDE_TESTING_MODULE=true
```

### Run

```bash
yarn dev       # Development with hot reload (port 3000)
yarn build     # Compile to dist/
```

---

## Testing

### Setup

Create `.env.test.local` with a separate test database:

```env
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
DB_NAME=blogger_platform_test
DISABLE_RATE_LIMIT=true
INCLUDE_TESTING_MODULE=true
```

### Commands

```bash
yarn test              # Run all tests (unit + e2e)
yarn test:unit         # Unit tests only (parallel)
yarn test:e2e          # E2E tests only (sequential, real DB)
yarn test:cov          # Test coverage report

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
├── e2e/
│   ├── e2e-auth/
│   ├── e2e-blogs/
│   ├── e2e-posts/
│   ├── e2e-comments/
│   └── e2e-users/
└── helpers/            # Test managers, init helpers, mock data
```

E2E tests use **Test Managers** (e.g. `BlogsTestManager`, `UsersTestManager`) for clean test data setup and reusable assertions via Supertest.

---

## Environment Variables Reference

| Variable                 | Description                | Example                  |
| ------------------------ | -------------------------- | ------------------------ |
| `MONGO_URL`              | MongoDB connection string  | `mongodb+srv://...`      |
| `DB_NAME`                | Database name              | `blogger_platform_dev`   |
| `AT_SECRET`              | JWT access token secret    | `supersecret`            |
| `AT_TIME`                | Access token TTL           | `5m`                     |
| `RT_SECRET`              | JWT refresh token secret   | `anothersecret`          |
| `RT_TIME`                | Refresh token TTL          | `7d`                     |
| `ADMIN_USERNAME`         | Basic auth username        | `admin`                  |
| `ADMIN_PASSWORD`         | Basic auth password        | `qwerty`                 |
| `EMAIL`                  | Sender email address       | `bot@gmail.com`          |
| `EMAIL_PASS`             | Google App Password        | `xxxx xxxx xxxx xxxx`    |
| `PORT`                   | Server port                | `3000` (default: `8080`) |
| `DISABLE_RATE_LIMIT`     | Disable throttling         | `true`                   |
| `INCLUDE_TESTING_MODULE` | Expose `/testing/all-data` | `true`                   |

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
├── config/                  # MongoDB, throttler, env config
├── core/                    # Shared: decorators, pipes, exceptions, constants
├── modules/
│   ├── bloggers-platform/   # Blogs, posts, comments (DDD modules)
│   └── user-accounts/       # Users, auth, guards, email
├── setup/                   # App bootstrap: pipes, swagger, global prefix
└── testing/                 # Testing controller (/testing/all-data)
```
