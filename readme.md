1. **Загальна ідея**

Запит від клієнта проходить такий шлях:

HTTP -> routes (request-payload + validation + http-handlers) -> application (services/handlers + commands/queries) -> repositories -> db -> назад через mappers + output types -> response.

Плюс зверху є спільне ядро core, де лежать помилки, загальні типи, utils, swagger, настройки БД тощо.

2. **core**

2.1 core/errors/types:

- validation-error.type.ts, validation-error.type-output.ts – типи, які описують, як виглядає помилка валідації всередині коду і у відповіді API.

  2.2 core/errors:

- application.error.ts – базовий клас для бізнес-помилок (наприклад, NotFound, Forbidden і т.д.).
- create-error-messages.error.ts – хелпери, які будують текст помилки (наприклад, “Driver is not found”).
- errors.handler.ts – глобальний error-handler для Express: ловить усі помилки і перетворює їх у нормальний JSON-response.
- repository-not-found.error.ts – помилка, коли репозиторій/ресурс не знайдений.

  2.3 core/helpers:

- create-command.helper.ts – базовий клас/хелпер для command об’єктів (CQRS стиль: команда на створення, оновлення тощо).
- set-default-sort-and-pagination.helper.ts – виставляє дефолтну пагінацію/сортування (page, pageSize, sortBy, sortDirection), якщо клієнт їх не передав.

  2.4 core/infrastructure/crypto:

- password-hasher.ts – обгортка над, наприклад, bcrypt. В одному місці описано: як хешувати пароль, порівнювати пароль з хешем.

  2.5 core/middlewares/validation - Express-middlewares, які перевіряють вхідні дані до того, як вони потраплять у handler:

- input-result.middleware-validation.ts – збирає помилки з валідації і віддає 400 з красивим JSON-ом.
- params-id.middleware-validation.ts – перевіряє :id (чи це валідний ObjectId і т.д.).
- query-pagination-sorting.middlewarevalidation.ts – перевіряє query-параметри пагінації/сортування.
- resources.middleware-validation.ts – перевіряє, що resources з resources-enum валідний.

  2.6 core/paths:

- paths.ts – централізоване місце з усіма URL-шляхами (/drivers, /rides і т.п.), щоб не розкидати строки по всьому проекту.

  2.7 core/result:

types/ -> application-result-body.type.ts, application-result-status.type.ts – типи, які описують статус виконання операції (success, not_found, bad_request тощо) та тіло результату.

- application.result.ts – універсальний клас/обгортка/паттерн для результатів сервісів: success(data), notFound(message), error(message) тощо.
- create-error-application.result.ts – хелпер, щоб легко створювати ApplicationResult з помилкою.

Тобто усі сервісні/аплікейшн-шари повертають не “голі” дані, а ApplicationResult. Потім http-handler дивиться на цей результат і вирішує, який статус коду віддати.

2.8 core/settings-mongoDB:

- settings-mongo.db.ts – налаштування Mongo: URI, ім’я бази, опції.

  2.9 core/swagger:

- setup-swagger.ts – ініціалізація Swagger UI + підключення \*.swagger.yml файлів.

  2.10 core/types - Це загальні generics/типи, які можна юзати в різних модулях:

- fields-only.type.ts – утиліта типів (наприклад, взяти тільки певні поля з типу).
- paginator-output.type.ts – тип для пагінованої відповіді (total, page, pageSize).
- pagination-sorting.type.ts – спільний тип для параметрів пагінації та сортування.
- resources.enum.ts – enum ресурсів (blogs, users, і т.д.).
- with-meta.type.ts – тип, який додає meta до відповіді.

  2.11 core/utils:

- http-status-codes.util.ts – enum/об’єкт з HTTP статус-кодами (200, 201, 400, 404, 500…).

3. **db**

- mongo.db.ts – функції для роботи з Mongo:

4. **blogs**

Тут уже функціональний модуль (bounded context) – все про блоги.

4.1 blogs/application - аплікейшн-шар – реалізація use-cases:

commands/:

- blog-dto-type.commands.ts – DTO для команд що треба, щоб створити блог (name, description, websiteUrl), що треба, щоб оновити блог. Саме командні DTO описують вхід для use-case-ів “create / update / delete”.

mappers/:

- map-to-blog-output.mapper.ts – маппер домен → output type (що віддаємо клієнту).
- map-to-blog-list-paginated.mapper.ts – маппер списку блогів + пагінаційної інформації → структура відповіді API.

output/:

- blog-type.output.ts – як виглядає один блог у відповіді.
- blog-list-paginated-type.output.ts – тип для пагінованого списку блогів, який вертає API.

query-handlers/:

- get-blogs-list-type.query-handler.ts – handler, який реалізує use-case: “отримати список блогів”; приймає DTO з фільтрами/пагінацією; викликає blog-query.repository; використовує маппери і повертає ApplicationResult з blogs-list-paginated-type.

- blog-query.service.ts – сервіс для читання (всі “get”).
- blogs.service.ts – сервіс для запису: create/update/delete драйвера; всередині викликає domain (створити entity), репозиторії, маппери;завертає все в ApplicationResult. Тобто application = сценарії використання (“створи водія”, “онови”, “дай список”).

  4.2 blogs/domain:

- blog.domain.ts – доменна-модель блога (entity): які поля є, які інваріанти, можливо методи типу updateBlog, deactivate, тощо.
- blog-dto.domain.ts – DTO, з яким працює домен, напр. CreateBlogDomainDto, UpdateBlogDomainDto. Домейн не знає про HTTP, Mongo, Express - тільки бізнес-логіка.

  4.3 blogs/repositories - Це рівень доступу до даних:

- drivers.repository.ts – основний репозиторій: працює напряму з Mongo-колекцією.
- driver-query.repository.ts – окремий репозиторій для читання (CQRS): методи для отримання списків з фільтрами, пагінацією, join з іншими колекціями, агрегації, пошук.

  4.4 blogs/routes - Це HTTP-шар – тут уже Express. Кожен handler: Забирає дані з req(body, params, query). Перетворює їх у відповідний command/query DTO. Викликає application service / handler. Береться ApplicationResult і на його основі відправляється HTTP-response.

http-handlers/:

- create-blog.handler.ts – Express-handler для POST /blogs.
- create-post-for-blog.handler.ts - для /blogs/:blogId/posts.
- get-blogs-list.handler.ts – для GET /blogs.
- get-blog.handler.ts – для GET /blog/:id.
- update-blog.handler.ts – для PUT/PATCH /blog/:id.
- delete-blog.handler.ts – для DELETE /blog/:id.
- get-blog-posts-list.handler.ts – GET /blogs/:blogId/posts і т.п.

request-payloads/:

- create-blog.request-payload.ts – тип, який описує тіло запиту для POST /blogs: name, description, websiteUrl тощо – саме в тому вигляді, як приходить з клієнта.
- update-blog.request-payload.ts – payload для оновлення блога.
- blogs-list.request-payload.ts – payload (query) для списку блогів: page, pageSize, sortBy, search…
- blog-errors.request-payload.ts – структура помилок для blog-запитів.
- blog-sort-field.request-payload.ts – enum, які поля можна використовувати для сортування (name, createdAt і т.д.).

Payload ≠ DTO.
RequestPayload – це HTTP-рівень (як виглядають дані в запиті).
Command / Query DTO – це вже чистий application-рівень (там можуть бути інші назви, перетворені типи тощо).

request-paload-validations/:

- create-blog-dto.request-payload-validation.ts – схема валідації (наприклад, zod/class-validator/express-validator) для create/update/list payload’ів.

- blogs.route.ts - Тут створюється Router, підключаються всі http-handlers і middlewares:

drivers/docs

drivers.swagger.yml – swagger-опис ендпоінтів, який потім підтягує core/swagger/setup-swagger.ts.

4. rides / testing / інше

rides – скоріш за все такий самий модуль, як drivers, тільки для поїздок. Структура буде аналогічна:

domain, repositories, application, routes, docs.

testing/docs, testing/routes – все, що стосується тестів (swagger-доки для тестування, окремі route’и під тестове оточення, e2e-тести тощо).

app.ts – створення і налаштування Express-додатку: підключення middleware, routes, swagger.

server.ts – запуск HTTP-сервера (app.listen(...)).

5. Як усе працює на прикладі одного запиту

Запит: POST /drivers (створити водія)

Запит прилітає у drivers.route.ts → маршрут POST /drivers.

Йдуть middleware:

валідація create-driver-request.payload → при помилці повертаємо 400.

Якщо ок:

create-driver.handler.ts отримує req.body, приводить до типу CreateDriverRequestPayload.

Handler створює Command DTO і викликає drivers.service.createDriver(commandDto).

drivers.service:

створює domain-entity Driver,

використовує drivers.repository для збереження в Mongo,

через mapper перетворює на DriverOutputType,

повертає ApplicationResult.success(data).

Handler дивиться на ApplicationResult, дістає statusCode та body, і відправляє клієнту JSON-response.

Якщо хочеш, наступним кроком можу:

взяти конкретний файл, наприклад create-driver-request.payload.ts або drivers.service.ts,

прямо на коді показати, що куди йде і як це зв’язано з іншими файлами.
