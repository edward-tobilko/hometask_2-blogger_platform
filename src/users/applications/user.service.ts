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

    const { email, password, login } = dto;

    // * Проверка уникальности login / email в BLL
    const existedUser = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      login,
      email
    );

    if (existedUser) {
      const field = existedUser.login === login ? "login" : "email";

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
    const hash = await this.passwordHasher.generateHash(password);

    // * DTO для доменной модели
    const domainDto: UserDtoDomain = {
      login,
      email,
      password: hash,
    };

    // * Создаем доменный обьект
    const newUser = UserDomain.createUser(domainDto);

    // * Сохраняем в репозитории
    const savedUser = await this.userRepo.createUserRepo(newUser);

    // * Возвращаем id созданного пользователя
    return new ApplicationResult({ data: { id: savedUser._id!.toString() } });
  }

  async deleteUser(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<null>> {
    const id = command.payload.id;

    const userId = await this.userQueryRepo.findUserByIdQueryRepo(id);

    if (!userId) {
      return new ApplicationResult<null>({
        errors: [
          new ApplicationError("User is not found", "id", "USER_NOT_FOUND"),
        ],
      });
    }

    const isDeleted = await this.userRepo.deleteUserRepo(id);

    if (!isDeleted) {
      return new ApplicationResult<null>({
        errors: [
          new ApplicationError("Deleting failed", "id", "DELETE_FAILED"),
        ],
      });
    }

    return new ApplicationResult<null>({ data: null });
  }
}

export const userService = new UserService();
