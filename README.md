# Sprint-2 / Week-4 — Refresh token / Cookie

Учебный backend-проект на **Node.js + Express + TypeScript**

---

## Реализованные концепции

### Service Layer (BLL)
- Бизнес-логика вынесена из HTTP-уровня в отдельный Service Layer.
- Сервисы не зависят от Express (`req`, `res`, `statusCode`).
- Взаимодействие с базой данных происходит через Repository layer.
- Сервисы возвращают результат выполнения, а не HTTP-ответ.
- Basic auth and JWT-авторизация.
- Реализованы E2E тесты.
- Работа с почтой с пом. SMTP-протокола.

**Поток выполнения:**

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

**Ключевые принципы**

- Routers отвечают только за HTTP-слой (Request Payload)
- Services содержат бизнес-логику (Command)
- Repositories работают с источниками данных (Domain)
- Ответ формируется через mapper’ы (Output)

## Технологии

- Node.js
- Express
- TypeScript
- MongoDB
- Express-Validator
- Jest
- Crypto

---

#### + дополнительно реализовано: расширение предыдущей функциональности from sprint-1 / week-4 + рефакторинг

- Добавлен новые энд-поинты: api/users -> GET / POST / DELETE.
- Розделения BLL service и repository на получения ( query ).
- Шифрование паролей с пом. bcrypt библиотеки.

#### + дополнительно реализовано: расширение предыдущей функциональности from sprint-2 / week-1 + рефакторинг

- Добавлен новые энд-поинты: api/auth -> GET, api/comments -> GET / PUT / DELETE, api/posts/{postId}/comments -> GET / POST.
- Создания и получения JWT-token пользователя.
- Создания и получения коментариев к постам под определенным jwt-токеном.

#### + дополнительно реализовано: расширение предыдущей функциональности from sprint-2 / week-2 + рефакторинг

- Добавлены новые энд-поинты: api/auth/registration -> POST, api/auth/registration-confirmation -> POST, api/auth/registration-email-resending -> POST.
- Реализована логика создания пользователя и отправки письма (nodemailer через smtp-протокол).
- Миграция хостинга from Render to Fly.io.

