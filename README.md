<h1 align="center">Blogger Platform API: Sprint-3 / Week-4 — Mongoose / DDD</h1>

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

Controller -> CommandHandler -> Service -> Domain / Entity -> Repository -> MongoDB -> Repository -> Domain / Entity (reconstitute) -> Service (ApplicationResult) -> Output / DTO

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
- DI / IoC
- Mongoose / DDD

### Environment Variables

```env

# fly secrets set -a hometask-2-blogger-platform

DB_NAME=your_db_name
MONGO_URL=your_mongodb_url

ADMIN_USERNAME=admin
ADMIN_PASSWORD=qwerty

JWT_ACCESS_SECRET=your_access_secret
AT_TIME=1h

JWT_REFRESH_SECRET=your_refresh_secret
RT_TIME=7d

SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
SMTP_SECURE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
DISABLE_RATE_LIMIT=false

```

---

<h3 align="center">Project Progress</h3>

<img width="457" height="576" alt="Screenshot 2026-03-31 at 8 14 28 PM" src="https://github.com/user-attachments/assets/6dfa4dee-b71b-49ee-99a6-5db18530cab8" />

[Download Sprint_3_week_4.pdf](https://github.com/user-attachments/files/26392248/Sprint_3_week_4.pdf)
