import { PasswordHasher } from "./../../auth/adapters/bcrypt-hasher-service.adapter";
import { ApplicationError } from "../../core/errors/application.error";
import { ApplicationResult } from "../../core/result/application.result";
import { WithMeta } from "../../core/types/with-meta.type";
import { UserRepository } from "../repositories/user.repository";
import { UsersQueryRepository } from "../repositories/users-query.repository";
import { CreateUserDtoCommand } from "./commands/user-dto.commands";
import { UserDtoDomain } from "../domain/user-dto.domain";
import { UserDomain } from "../domain/user.domain";

class UserService {
  private userRepo: UserRepository;
  private userQueryRepo: UsersQueryRepository;
  private passwordHasher: PasswordHasher;

  constructor() {
    this.userRepo = new UserRepository();
    this.userQueryRepo = new UsersQueryRepository();
    this.passwordHasher = new PasswordHasher();
  }

  async createUser(
    command: WithMeta<CreateUserDtoCommand>
  ): Promise<ApplicationResult<{ id: string } | null>> {
    const dto = command.payload;

    // * Проверка уникальности login / email в BLL
    const existedUser = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      dto.login,
      dto.email
    );

    if (existedUser) {
      const field = existedUser.login === dto.login ? "login" : "email";

      return new ApplicationResult<{ id: string } | null>({
        errors: [
          new ApplicationError(
            `${field} should be unique`, // detail (message)
            field, // source (поле: login або email)
            "USER_NOT_UNIQUE" // code (можно любой свой)
          ),
        ],
      });
    }

    // * Генерация хеша пароля
    const hash = await this.passwordHasher.generateHash(dto.password);

    // * DTO для доменной модели
    const domainDto: UserDtoDomain = {
      login: dto.login,
      email: dto.email,
      password: hash,
    };

    // * Создаем доменный обьект
    const newUser = UserDomain.createUser(domainDto);

    // * Сохраняем в репозитории
    const savedUser = await this.userRepo.createUserRepo(newUser);

    // * Возвращаем id созданного пользователя
    return new ApplicationResult({ data: { id: savedUser._id!.toString() } });
  }
}

export const userService = new UserService();
