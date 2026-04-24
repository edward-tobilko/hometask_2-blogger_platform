# Blogger Platform API

> Production-ready REST API for a blogging platform built with Node.js, TypeScript, and MongoDB.  
> Clean DDD architecture with NestJS, CQRS-like pattern, Swagger documentation, and full validation.

🔗 **Live:** [hometask-2-blogger-platform.fly.dev/api](https://hometask-2-blogger-platform.fly.dev/api/blogs)  
📖 **Swagger UI:** [hometask-2-blogger-platform.fly.dev/api](https://hometask-2-blogger-platform.fly.dev/api)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | NestJS v11 (Platform Express) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Validation | class-validator + class-transformer |
| API Docs | @nestjs/swagger (Swagger / OpenAPI 3.0) |
| Rate Limiting | @nestjs/throttler |
| Password | bcrypt |
| Testing | Jest + Supertest |
| Hosting | Fly.io |

---

## Architecture

The project follows **DDD (Domain-Driven Design)** principles with a clean layered structure and a **CQRS-like** read/write separation:

```
src/
├── main.ts
├── app.module.ts
├── setup/                        # App bootstrap (pipes, prefix, swagger)
├── core/                         # Shared DTOs, enums, constants, sub-schemas
└── modules/
    ├── bloggers-platform/        # Blogs, Posts, Comments
    │   ├── blogs/
    │   │   ├── api/              # Controller, input/view DTOs
    │   │   ├── application/      # BlogsService (write) + BlogsQueryService (read)
    │   │   ├── infrastructure/   # BlogsRepository + BlogsQueryRepository
    │   │   └── domain/           # Blog entity, domain DTOs
    │   ├── posts/                # Same structure
    │   └── comments/             # Same structure
    └── user-accounts/            # Users
        ├── api/
        ├── application/
        ├── infrastructure/
        └── domain/
```

**Request flow:**
```
Controller → Service → Domain Entity → Repository → MongoDB
                ↑                           ↓
        class-validator DTO         Mongoose + lean()
```

**CQRS separation:**
```
Write path:  Controller → *Service       → *Repository
Read path:   Controller → *QueryService  → *QueryRepository
```

---

## Key Features

- **NestJS modules** — BloggersPlatformModule + UserAccountsModule, fully isolated
- **CQRS-like pattern** — separate read/write services and repositories per module
- **Swagger documentation** — auto-generated at `/api`, enriched with `@ApiProperty`
- **Global validation pipe** — whitelist + transform + forbidNonWhitelisted
- **Pagination & Sorting** — on all list endpoints via shared base `QueryDto`
- **Soft delete** — users have `deletedAt` field, not physically removed
- **Rate limiting** — Throttler module (5 req / 10 sec per IP)
- **MongoDB indexes** — `createdAt` indexed on all collections for sorting performance
- **Like / Dislike system** — posts and comments with newest likes tracking
- **Email confirmation** — registration flow with email verification
- **Refresh token rotation** — each refresh issues a new pair, old token invalidated
- **Session management** — device tracking, terminate specific or all sessions

---

## API Endpoints

### Blogs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs` | Get all blogs (paginated) |
| POST | `/api/blogs` | Create blog (admin) |
| GET | `/api/blogs/:id` | Get blog by ID |
| PUT | `/api/blogs/:id` | Update blog (admin) |
| DELETE | `/api/blogs/:id` | Delete blog (admin) |
| GET | `/api/blogs/:blogId/posts` | Get posts for blog (paginated) |
| POST | `/api/blogs/:blogId/posts` | Create post for blog (admin) |

### Posts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Get all posts (paginated) |
| POST | `/api/posts` | Create post (admin) |
| GET | `/api/posts/:id` | Get post by ID |
| PUT | `/api/posts/:id` | Update post (admin) |
| DELETE | `/api/posts/:id` | Delete post (admin) |
| GET | `/api/posts/:postId/comments` | Get comments for post |
| POST | `/api/posts/:postId/comments` | Create comment |
| PUT | `/api/posts/:postId/like-status` | Like / Dislike post |

### Comments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/:id` | Get comment by ID |
| PUT | `/api/comments/:id` | Update comment |
| DELETE | `/api/comments/:id` | Delete comment |
| PUT | `/api/comments/:id/like-status` | Like / Dislike comment |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users (paginated) |
| POST | `/api/users` | Create user (admin) |
| DELETE | `/api/users/:id` | Delete user (soft delete) |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns access + refresh tokens |
| POST | `/api/auth/logout` | Logout, clears session |
| POST | `/api/auth/refresh-token` | Rotate refresh token |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/registration` | Register new user |
| POST | `/api/auth/registration-confirmation` | Confirm email |
| POST | `/api/auth/registration-email-resending` | Resend confirmation email |
| POST | `/api/auth/password-recovery` | Send recovery email |
| POST | `/api/auth/new-password` | Set new password |

### Security Devices

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/security/devices` | Get all active sessions |
| DELETE | `/api/security/devices` | Terminate all other sessions |
| DELETE | `/api/security/devices/:deviceId` | Terminate specific session |

### Testing

| Method | Endpoint | Description |
|---|---|---|
| DELETE | `/api/testing/all-data` | Wipe all data from DB |

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/edward-tobilko/hometask-2-blogger-platform.git
cd hometask-2-blogger-platform

# 2. Install dependencies
yarn install

# 3. Create env file
cp .env.example .env.development.local

# 4. Run in development
yarn dev

# 5. Open Swagger
open http://localhost:3000/api
```

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development

MONGO_URL=mongodb+srv://...
DB_NAME=home_task2-blogger_platform_dev

ADMIN_USERNAME=admin
ADMIN_PASSWORD=qwerty

AT_SECRET=your_access_secret
AT_TIME=1h

RT_SECRET=your_refresh_secret
RT_TIME=7d

EMAIL=your_email@gmail.com
EMAIL_PASS=your_app_password

DISABLE_RATE_LIMIT=true
```

Env files per environment: `.env.development.local`, `.env.test.local`, `.env.production.local`

---

## Response Format

All list endpoints return a paginated response:

```json
{
  "pagesCount": 5,
  "page": 1,
  "pageSize": 10,
  "totalCount": 50,
  "items": []
}
```

Validation error response:

```json
{
  "errorsMessages": [
    {
      "message": "Field is required",
      "field": "email"
    }
  ]
}
```

---

## Scripts

```bash
yarn dev              # Start with hot reload
yarn build            # Compile TypeScript to dist/
yarn test             # Run all tests
yarn test:unit        # Unit tests only
yarn test:e2e         # E2E tests (sequential, real test DB)
yarn lint             # ESLint with auto-fix
yarn format           # Prettier
yarn seed:blogs       # Seed blogs into DB
```

---

## Deploy to Fly.io

```bash
# Deploy
yarn fly

# Set secrets
fly secrets set MONGO_URL=... AT_SECRET=... RT_SECRET=...

# View logs
fly logs
```

[Download Sprint_4_week_1.pdf](https://github.com/user-attachments/files/26392248/Sprint_3_week_4.pdf)
