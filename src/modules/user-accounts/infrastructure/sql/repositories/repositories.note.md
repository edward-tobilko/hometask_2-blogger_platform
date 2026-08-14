# UsersSqlRepository

1. Почему класс, а не строка ?

В `Mongoose` -> @InjectModel(UserAccount.name) -> 'UserAccount' (строка).
Mongoose регистрирует модели по имени строки. Поэтому токен — строка.

В `TypeORM` -> @InjectRepository(UserAccountOrmEntity) -> сам класс.  
TypeORM регистрирует репозитории по ссылке на класс. Класс и есть токен. Это надёжнее — нет риска опечататься в строке, TypeScript проверяет на этапе компиляции.

2. Что такое Repository<UserAccountOrmEntity> ?

`Repository` — это встроенный TypeORM-класс с готовыми методами для работы с БД:

- this.usersRepo.find() -> SELECT \* FROM user_accounts
- this.usersRepo.findOne(...) -> SELECT ... WHERE ...
- this.usersRepo.save(entity) -> INSERT или UPDATE
- this.usersRepo.delete(id) -> DELETE WHERE id = ...

Generic <UserAccountOrmEntity> говорит TypeScript: "этот репозиторий работает конкретно с UserAccountOrmEntity". Без него методы не знали бы какой тип возвращать.

Аналогия: это как Model<UserAccountDocument> в Mongoose — тоже типизированная обёртка над коллекцией.

3. Почему `readonly` ?

`readonly` означает: после того как NestJS вставил зависимость через конструктор — никто не может заменить usersRepo на другой объект. Это защита от случайного переприсвоения внутри класса:

- this.usersRepo = somethingElse; // без readonly — это сработало бы -> баг
- с readonly — ошибка компиляции

`private` — снаружи класса не видно. `readonly` — внутри класса нельзя переписать. Вместе это гарантирует что репозиторий всегда тот, что пришёл через DI.

---

`IsNull()` - оператор явно говорит: "сгенерируй IS NULL в SQL". Без него TypeORM не может построить правильный запрос. В SQL это превратится в -> WHERE id = $1 AND deleted_at IS NULL.
