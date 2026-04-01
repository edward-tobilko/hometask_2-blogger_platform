# Blogger Platform API

> Production-ready REST API for a blogging platform built with Node.js, TypeScript, and MongoDB.  
> Clean DDD architecture with JWT authentication, refresh token rotation, and E2E test coverage.

🔗 **Live:** [hometask-2-blogger-platform.fly.dev/api](https://hometask-2-blogger-platform.fly.dev/api/blogs)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express + express-validator |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| DI / IoC | InversifyJS |
| Email | Nodemailer (Gmail SMTP) |
| Testing | Jest + Supertest |
| Hosting | Fly.io |

---

## Architecture

The project follows **DDD (Domain-Driven Design)** principles with a clean layered structure:

```
src/
├── auth/
│   ├── application/        # Services, interfaces, commands
│   ├── domain/             # Entities, mappers, value-objects
│   ├── infrastructure/     # Repositories, schemas, external-api
│   └── presentation/       # Controllers, middlewares, routes
├── blogs/
├── posts/
├── comments/
├── users/
└── core/                   # Shared utils, errors, result types
```

**Request flow:**
```
Controller → Service → Domain Entity → Repository → MongoDB
                ↑                           ↓
         ApplicationResult          Entity reconstitute
```

---

## Key Features

- **JWT Auth** — access token in header, refresh token in HttpOnly cookie
- **Refresh token rotation** — each refresh issues a new pair, old token invalidated
- **Session management** — device tracking, terminate specific or all sessions
- **Like / Dislike system** — posts and comments with newest likes tracking
- **Email confirmation** — registration flow with email verification via SMTP
- **Password recovery** — recovery code sent to email with expiration
- **Rate limiting** — protection on auth endpoints
- **Pagination & Sorting** — on all list endpoints
- **MongoDB TTL indexes** — automatic session cleanup

---

## API Endpoints

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

### Blogs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs` | Get all blogs (paginated) |
| GET | `/api/blogs/:id` | Get blog by id |
| POST | `/api/blogs` | Create blog (admin) |
| PUT | `/api/blogs/:id` | Update blog (admin) |
| DELETE | `/api/blogs/:id` | Delete blog (admin) |
| GET | `/api/blogs/:id/posts` | Get posts for blog |
| POST | `/api/blogs/:id/posts` | Create post for blog (admin) |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Get all posts (paginated) |
| GET | `/api/posts/:id` | Get post by id |
| POST | `/api/posts` | Create post (admin) |
| PUT | `/api/posts/:id` | Update post (admin) |
| DELETE | `/api/posts/:id` | Delete post (admin) |
| GET | `/api/posts/:postId/comments` | Get comments for post |
| POST | `/api/posts/:postId/comments` | Create comment |
| PUT | `/api/posts/:postId/like-status` | Like / Dislike post |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/:id` | Get comment by id |
| PUT | `/api/comments/:id` | Update comment |
| DELETE | `/api/comments/:id` | Delete comment |
| PUT | `/api/comments/:id/like-status` | Like / Dislike comment |

### Security Devices
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/security/devices` | Get all active sessions |
| DELETE | `/api/security/devices` | Terminate all other sessions |
| DELETE | `/api/security/devices/:deviceId` | Terminate specific session |

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/edward-tobilko/hometask-2-blogger-platform.git
cd hometask-2-blogger-platform

# 2. Install dependencies
yarn install

# 3. Create .env file
cp .env.example .env

# 4. Run in development
yarn dev

# 5. Run tests
yarn test
```

---

## Environment Variables

```env
MONGO_URL=mongodb+srv://...
DB_NAME=your_db_name

ADMIN_USERNAME=admin
ADMIN_PASSWORD=qwerty

AT_SECRET=your_access_secret
AT_TIME=1h

RT_SECRET=your_refresh_secret
RT_TIME=7d

EMAIL=your_email@gmail.com
EMAIL_PASS=your_app_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true

NODE_ENV=development
PORT=8080
```

---

## Response Format

All list endpoints return paginated response:

```json
{
  "pagesCount": 5,
  "page": 1,
  "pageSize": 10,
  "totalCount": 50,
  "items": []
}
```

Error response:

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

## Deploy to Fly.io

```bash
# Build and deploy
yarn fly:deploy

# Set environment variables
fly secrets set MONGO_URL=... AT_SECRET=... RT_SECRET=...

# View logs
fly logs
```

[Download Sprint_3_week_4.pdf](https://github.com/user-attachments/files/26392248/Sprint_3_week_4.pdf)
