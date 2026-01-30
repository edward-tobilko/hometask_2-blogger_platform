# Sprint-2 / Week-2 — JWT-token and headers-authorization

Учебный backend-проект на **Node.js + Express + TypeScript**

---

## Реализованные концепции

### Service Layer (BLL)
- Бизнес-логика вынесена из HTTP-уровня в отдельный Service Layer
- Сервисы не зависят от Express (`req`, `res`, `statusCode`)
- Взаимодействие с базой данных происходит через Repository layer
- Сервисы возвращают результат выполнения, а не HTTP-ответ
- Базовая авторизация ( base64 ).
- Реализованы E2E тесты.

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

- Routers отвечают только за HTTP-слой
- Services содержат бизнес-логику
- Repositories работают с источниками данных
- Ответ формируется через mapper’ы

## Технологии

- Node.js
- Express
- TypeScript
- MongoDB
- Express-Validator
- Jest

---

<h3 align="center">Project Progress</h3>

### sprint-1 / week-4 + added:
- Новые энд-поинты: GET / POST / DELETE: api/users.
- Розделения BLL service и repository на получения query (CQRS separation).
- Шифрование паролей с пом. bcrypt библиотеки.

### sprint-2 / week-1 + added:
- Новые энд-поинты: GET: api/auth, GET / PUT / DELETE: api/comments, GET / POST: api/posts/{postId}/comments.
- Создания и получения JWT-token пользователя.
- Создания и получения коментариев к постам под определенным jwt-токеном.
