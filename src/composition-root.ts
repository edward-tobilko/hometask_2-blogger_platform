import { BcryptPasswordHasher } from "auth/adapters/bcrypt-hasher-service.adapter";
import { UsersService } from "users/applications/user.service";
import { UsersRepository } from "users/repositories/user.repository";
import { UsersQueryRepository } from "users/repositories/users-query.repository";
import { UsersController } from "users/routes/users-controller";

// * Repositories
const usersRepo = new UsersRepository();
const usersQueryRepo = new UsersQueryRepository();
const passwordHasher = new BcryptPasswordHasher();

// * Services
const usersService = new UsersService(
  usersRepo,
  usersQueryRepo,
  passwordHasher
);

// * Controllers
const usersController = new UsersController(usersService);

// ? DI (Dependency injection) - внедрение зависимостей. Нужны для:
// ? - гибкости: зависимости могут быть легко заменены на другие
// ? - легко тестировать (unit): легко внедрять моки вместо реальных зависимостей приложений.
// ? - соблюдение принципа инверсии зависимостей (Dependency Inversion Principle): Код становится зависимым от абстракций, а не от конкретных реализаций.

// ? IoC (Inversion of Control) Container - это объект который занимаеться управлением жизненным циклом других граф-зависимостей (как зависят объекты друг от друга (НЕ КЛАССЫ: UsersService ЗАВИСИТ ОТ UsersRepository, А ОБЪЕКТЫ: usersService ОТ usersRepo)).
