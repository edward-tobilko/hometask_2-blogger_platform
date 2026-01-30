<h1 align="center">Blogger Platform API: Sprint-3 / Week-1 — Multi devices / IP-Restrictions</h1>

Backend REST API built with **Node.js + Express + TypeScript**  
Educational project with production-oriented architecture and E2E tests.

- 🔗 **Live API:** [hometask-2-blogger-platform.fly.dev](https://hometask-2-blogger-platform.fly.dev/api)
- 🔗 **Previous hosting (deprecated):** [https://hometask-2-blogger-platform.onrender.com](https://hometask-2-blogger-platform.onrender.com/api)

<h1 align="center">About</h1>

This project is a backend REST API for a blogging platform.
It demonstrates a **clean layered architecture**, JWT authentication,
refresh tokens via cookies, and full E2E test coverage.

The project was developed as part of a multi-sprint learning program
with continuous refactoring and feature expansion.

---

<h1 align="center">Реализованные концепции</h1>

### Service Layer (BLL)
- Бизнес-логика вынесена из HTTP-уровня в отдельный Service Layer: сервисы не зависят от Express (`req`, `res`, `statusCode`).
- Взаимодействие с базой данных происходит через Repository layer.
- Сервисы возвращают результат выполнения, а не HTTP-ответ.
- Basic auth and JWT-авторизация (access / refresh tokens).
- Реализованы E2E тесты (Jest).
- Работа с почтой с пом. SMTP-протокола.

### Поток выполнения:

Handler (Controller) → Service (BLL) → Repository → Database

---

### Pagination & Sorting
Реализована универсальная пагинация и сортировка для списковых endpoint’ов.

**Поддерживаемые query-параметры:**
- `pageNumber`
- `pageSize`
- `sortBy`
- `sortDirection`

Параметры валидируются с помощью `express-validator` и имеют значения по умолчанию.

---

### Формирование ответа (JSON API style)
Ответ формируется в mapper’ах и содержит:
- `meta` — информацию о страницах
- `data` — массив сущностей

**Пример структуры ответа:**
```json
{
  "meta": {
    "page": 1,
    "pageSize": 10,
    "pageCount": 5,
    "totalCount": 50
  },
  "data": []
}
```

### Ключевые принципы

- Routers отвечают только за HTTP-слой (Request Payload)
- Services содержат бизнес-логику (Command)
- Repositories работают с источниками данных (Domain)
- Ответ формируется через mapper’ы (Output)

### Технологии

- Node.js / TypeScript
- Express (Express-Validator)
- MongoDB (TTL indexes)
- Jest + Supertest
- Crypto / Bcrypt
- Nodemailer (SMTP)
- Render / Fly.io

### Environment Variables

```env

MONGO_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password

# fly secrets set -a hometask-2-blogger-platform \
# NODE_ENV=production \
# MONGO_URL='mongodb+srv://1992eduard777_db_user:!Miami4769@hometask-2.zq4rutx.mongodb.net' \
# DB_NAME='home_task2-blogger_platform_prod' \
# ADMIN_USERNAME='admin' \
# ADMIN_PASSWORD='qwerty' \
# AT_SECRET='prod_access_secret_123!@#' \
# AT_TIME='10s' \
# RT_SECRET='prod_refresh_secret_456!@#' \
# RT_TIME='20s' \
# SMTP_HOST='smtp.gmail.com' \
# SMTP_PORT='587' \
# SMTP_SECURE='true' \
# EMAIL='eduardtobilko@gmail.com' \
# EMAIL_PASS='cjanstjhaohjjzrr'

```

---

<h3 align="center">Project Progress</h3>

## sprint-1 / week-4
### Added:
- Новые энд-поинты: GET / POST / DELETE: api/users.
- Розделения BLL service и repository на получения query (CQRS separation).
- Шифрование паролей с пом. bcrypt библиотеки.

## sprint-2 / week-1
### Added:
- Новые энд-поинты: GET: api/auth, GET / PUT / DELETE: api/comments, GET / POST: api/posts/{postId}/comments.
- Создания и получения JWT-token пользователя.
- Создания и получения коментариев к постам под определенным jwt-токеном.

## sprint-2 / week-2
### Added:
- Новые энд-поинты: POST: api/auth/registration, POST: api/auth/registration-confirmation, POST: api/auth/registration-email-resending.
- Реализована логика создания пользователя и отправки письма (nodemailer через smtp-протокол).
- Миграция хостинга from [Render.com ](https://render.com) to [Fly.io](https://fly.io).

## sprint-2 / week-3
### Added:
- Новые энд-поинты: POST: api/auth/login, POST: api/auth/refresh-token, POST: api/auth/logout, GET: api/auth/me.
- Работа с accessToken and refreshToken.
