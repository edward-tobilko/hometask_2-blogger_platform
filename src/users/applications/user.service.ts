import { BcryptPasswordHasher } from "./../../auth/adapters/bcrypt-hasher-service.adapter";
import { ApplicationResult } from "../../core/result/application.result";
import { WithMeta } from "../../core/types/with-meta.type";
import { UserRepository } from "../repositories/user.repository";
import { UsersQueryRepository } from "../repositories/users-query.repository";
import { CreateUserDtoCommand } from "./commands/user-dto.commands";
import { UserDtoDomain } from "../domain/user-dto.domain";
import { UserDomain } from "../domain/user.domain";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { UserOutput } from "./output/user.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import { ValidationError } from "../../core/errors/application.error";

class UserService {
  private userRepo: UserRepository;
  private userQueryRepo: UsersQueryRepository;
  private passwordHasher: BcryptPasswordHasher;

  constructor() {
    this.userRepo = new UserRepository();
    this.userQueryRepo = new UsersQueryRepository();
    this.passwordHasher = new BcryptPasswordHasher();
  }

  async createUser(
    command: WithMeta<CreateUserDtoCommand>
  ): Promise<ApplicationResult<UserOutput>> {
    const dto = command.payload;

    const { email, password, login } = dto;

    // * Проверка уникальности login / email в BLL
    const existedUser = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      login,
      email
    );

    if (existedUser) {
      const field = existedUser.login === login ? "login" : "email";

      throw new ValidationError(
        `${field} should be unique`, // message
        field // field (поле: login або email)
      );
    }

    // * Генерация хеша пароля
    const hash = await this.passwordHasher.generateHash(password);

    // * DTO для доменной модели
    const domainDto: UserDtoDomain = {
      login,
      password: hash,
      email,
    };

    // * Создаем доменный обьект
    const newUser = UserDomain.createUser(domainDto);

    // * Сохраняем в репозитории
    const savedUser = await this.userRepo.createUserRepo(newUser);

    const userOutput: UserOutput = {
      id: savedUser._id!.toString(),
      login: savedUser.login,
      email: savedUser.email,
      createdAt: savedUser.createdAt.toISOString(),
    };

    // * Возвращаем id созданного пользователя
    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: userOutput,
      extensions: [],
    });
  }

  async deleteUser(command: WithMeta<{ id: string }>): Promise<boolean> {
    const id = command.payload.id;

    const userId = await this.userQueryRepo.findUserByIdQueryRepo(id);

    if (!userId) {
      throw new RepositoryNotFoundError("User is not found!", "userId");
    }

    return await this.userRepo.deleteUserRepo(id);
  }
}

export const userService = new UserService();
