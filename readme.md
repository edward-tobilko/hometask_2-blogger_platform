1. **Общая идея**

Запрос от клиента проходит следующий путь:

HTTP -> routes (request-payload + validation + http-handlers) -> application (services/handlers + commands/queries) -> repositories -> db -> обратно через mappers + output types -> response.

Плюс сверху есть общее ядро core, где находятся ошибки, общие типы, utils, swagger, настройки БД и т. д.

2. **core**

2.1 core/errors/types:

- validation-error.type.ts, validation-error.type-output.ts – типы, которые описывают, как выглядит ошибка валидации внутри кода и в ответе API.

  2.2 core/errors:

- application.error.ts – базовый класс для бизнес-ошибок (например, NotFound, Forbidden и т.д.).
- create-error-messages.error.ts – хелперы, которые строят текст ошибки (например, «Driver is not found»).
- errors.handler.ts – глобальный error-handler для Express: ловит все ошибки и преобразует их в нормальный JSON-response.
- repository-not-found.error.ts – ошибка, когда репозиторий/ресурс не найден.

  2.3 core/helpers:

- create-command.helper.ts – базовый класс/хелпер для command объектов (CQRS стиль: команда на создание, обновление и т.д.).
- set-default-sort-and-pagination.helper.ts – выставляет дефолтную пагинацию/сортировку (page, pageSize, sortBy, sortDirection), если клиент их не передал.

  2.4 core/infrastructure/crypto:

- password-hasher.ts – обертка над, например, bcrypt. В одном месте описано: как хешировать пароль, сравнивать пароль с хешем.

  2.5 core/middlewares/validation - Express-middlewares, которые проверяют входные данные до того, как они попадут в handler:

- input-result.middleware-validation.ts – собирает ошибки из валидации и отдает 400 с красивым JSON-ом.
- params-id.middleware-validation.ts – проверяет :id (является ли это валидным ObjectId и т.д.).
- query-pagination-sorting.middlewarevalidation.ts – проверяет query-параметры пагинации/сортировки.
- resources.middleware-validation.ts – проверяет, что resources из resources-enum валиден.

  2.6 core/paths:

- paths.ts – централизованное место со всеми URL-путями (/drivers, /rides и т.п.), чтобы не разбрасывать строки по всему проекту.

  2.7 core/result:

types/ -> application-result-body.type.ts, application-result-status.type.ts – типы, которые описывают статус выполнения операции (success, not_found, bad_request и т.д.) и тело результата.

- application.result.ts – универсальный класс/обертка/паттерн для результатов сервисов: success(data), notFound(message), error(message) и т.д.
- create-error-application.result.ts – хелпер, чтобы легко создавать ApplicationResult с ошибкой.

То есть все сервисные/прикладные слои возвращают не «голые» данные, а ApplicationResult. Затем http-handler смотрит на этот результат и решает, какой статус кода отдать.

2.8 core/settings-mongoDB:

- settings-mongo.db.ts – настройки Mongo: URI, имя базы, опции.

  2.9 core/swagger:

- setup-swagger.ts – инициализация Swagger UI + подключение \*.swagger.yml файлов.

  2.10 core/types - Это общие generics/типы, которые можно использовать в разных модулях:

- fields-only.type.ts – утилита типов (например, взять только определенные поля из типа).
- paginator-output.type.ts – тип для пагинационного ответа (total, page, pageSize).
- pagination-sorting.type.ts – общий тип для параметров пагинации и сортировки.
- resources.enum.ts – enum ресурсов (blogs, users, и т.д.).
- with-meta.type.ts – тип, который добавляет meta к ответу.

  2.11 core/utils:

- http-status-codes.util.ts – enum/объект с HTTP статус-кодами (200, 201, 400, 404, 500…).

3. **db**

- mongo.db.ts – функции для работы з Mongo:

4. **blogs**

Здесь уже функциональный модуль (bounded context) – все о блогах.

4.1 blogs/application – прикладной слой – реализация use-cases:

commands/:

- blog-dto-type.commands.ts – DTO для команд, необходимых для создания блога (name, description, websiteUrl) и обновления блога. Именно командные DTO описывают вход для use-case-ов «create / update / delete».

mappers/:

- map-to-blog-output.mapper.ts – маппер домен → output type (что отдаем клиенту).
- map-to-blog-list-paginated.mapper.ts – маппер списка блогов + пагинационной информации → структура ответа API.

output/:

- blog-type.output.ts – как выглядит один блог в ответе.
- blog-list-paginated-type.output.ts – тип для пагинационного списка блогов, который возвращает API.

query-handlers/:

- get-blogs-list-type.query-handler.ts – handler, который реализует use-case: «получить список блогов»; принимает DTO с фильтрами/пагинацией; вызывает blog-query.repository; использует мапперы и возвращает ApplicationResult с blogs-list-paginated-type.

- blog-query.service.ts – сервис для чтения (все «get»).
- blogs.service.ts – сервис для записи: create/update/delete драйвера; внутри вызывает domain (создать entity), репозитории, мапперы; возвращает все в ApplicationResult. То есть application = сценарии использования («создай водителя», «обнови», «дай список»).

4.2 blogs/domain:

- blog.domain.ts – доменная модель блога (entity): какие поля есть, какие инварианты, возможно методы типа updateBlog, deactivate и т. д.
- blog-dto.domain.ts – DTO, с которым работает домен, например CreateBlogDomainDto, UpdateBlogDomainDto. Домен не знает о HTTP, Mongo, Express – только бизнес-логика.

4.3 blogs/repositories - Это уровень доступа к данным:

- drivers.repository.ts – основной репозиторий: работает напрямую с Mongo-коллекцией.
- driver-query.repository.ts – отдельный репозиторий для чтения (CQRS): методы для получения списков с фильтрами, пагинацией, join с другими коллекциями, агрегации, поиск.

  4.4 blogs/routes - Это HTTP-слой – здесь уже Express. Каждый handler: Забирает данные из req(body, params, query). Преобразует их в соответствующий command/query DTO. Вызывает application service / handler. Берется ApplicationResult и на его основе отправляется HTTP-response.

http-handlers/:

- create-blog.handler.ts – Express-handler для POST /blogs.
- create-post-for-blog.handler.ts - для /blogs/:blogId/posts.
- get-blogs-list.handler.ts – для GET /blogs.
- get-blog.handler.ts – для GET /blog/:id.
- update-blog.handler.ts – для PUT/PATCH /blog/:id.
- delete-blog.handler.ts – для DELETE /blog/:id.
- get-blog-posts-list.handler.ts – GET /blogs/:blogId/posts и т.п.

request-payloads/:

- create-blog.request-payload.ts – тип, который описывает тело запроса для POST /blogs: name, description, websiteUrl и т.д. – именно в том виде, как приходит от клиента.
- update-blog.request-payload.ts – payload для обновления блога.
- blogs-list.request-payload.ts – payload (query) для списка блогов: page, pageSize, sortBy, search…
- blog-errors.request-payload.ts – структура ошибок для blog-запросов.
- blog-sort-field.request-payload.ts – enum, какие поля можно использовать для сортировки (name, createdAt и т.д.).

Payload ≠ DTO.
RequestPayload – это HTTP-уровень (как выглядят данные в запросе).
Command / Query DTO – это уже чистый application-уровень (там могут быть другие названия, преобразованные типы и т.д.).

request-paload-validations/:

- create-blog-dto.request-payload-validation.ts – схема валидации (например, zod/class-validator/express-validator) для create/update/list payload’ов.

- blogs.route.ts - Здесь создается Router, подключаются все http-handlers и middlewares:

- app.ts – создание и настройка Express-приложения: подключение middleware, routes, swagger.
- server.ts – запуск HTTP-сервера (app.listen(...)).

5. Как все работает на примере одного запроса:

Запрос: POST /blogs (создать пост).
Запрос прилетает в blogs.route.ts → маршрут POST /blogs.

Идут middleware: валидация create-blog-dto.request-payload-validation.ts → при ошибке возвращаем 400. Если ок:

- create-blog.handler.ts получает req.body, приводит к типу CreateBlogRequestPayload.
- Handler создает Command DTO и вызывает blogsService.createBlog(commandDto).

blogs.service:

- создает domain-entity Blog,
- использует blogs.repository для сохранения в Mongo,
- через mapper преобразует в BlogOutput,
- возвращает ApplicationResult.success(data).

Handler смотрит на ApplicationResult, получает statusCode и body, и отправляет клиенту JSON-response.
