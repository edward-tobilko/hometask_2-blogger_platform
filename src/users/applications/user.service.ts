import { BcryptPasswordHasher } from "./../../auth/adapters/bcrypt-hasher-service.adapter";
import { ApplicationResult } from "../../core/result/application.result";
import { WithMeta } from "../../core/types/with-meta.type";
import { UsersRepository } from "../repositories/user.repository";
import { UsersQueryRepository } from "../repositories/users-query.repository";
import { CreateUserDtoCommand } from "./commands/user-dto.commands";
import { UserDtoDomain } from "../domain/user-dto.domain";
import { UserDomain } from "../domain/user.domain";
import { UserOutput } from "./output/user.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import {
  NotFoundError,
  ValidationError,
} from "../../core/errors/application.error";

export class UsersService {
  constructor(
    private usersRepo: UsersRepository,
    private usersQueryRepo: UsersQueryRepository,
    private passwordHasher: BcryptPasswordHasher
  ) {}

  async createUser(
    command: WithMeta<CreateUserDtoCommand>
  ): Promise<ApplicationResult<UserOutput>> {
    const dto = command.payload;

    const { email, password, login } = dto;

    // * Проверка уникальности login / email в BLL
    const existedUserByEmail =
      await this.usersQueryRepo.findByEmailQueryRepo(email);

    if (existedUserByEmail)
      throw new ValidationError("Email should be unique", "email", 422);

    const existedUserByLogin =
      await this.usersQueryRepo.findByLoginQueryRepo(login);

    if (existedUserByLogin)
      throw new ValidationError("Login should be unique", "login", 422);

    // * Генерация хеша пароля
    const hash = await this.passwordHasher.generateHash(password);

    // * DTO для доменной модели
    const domainDto: UserDtoDomain = {
      login,
      password: hash,
      email,
    };

    // * Создаем доменный обьект
    const newUser = UserDomain.createAdminUser(domainDto);

    // * Сохраняем в репозитории
    const savedUser = await this.usersRepo.createUserRepo(newUser);

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

  async deleteUser(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<boolean>> {
    const id = command.payload.id;

    const userId = await this.usersQueryRepo.findUserByIdQueryRepo(id);

    if (!userId) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: false,
        extensions: [new NotFoundError("User is not found!", "userId")],
      });
    }

    const deleted = await this.usersRepo.deleteUserRepo(id);

    if (!deleted) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: false,
        extensions: [new NotFoundError("Bad request", "userId")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.NoContent,
      data: true,
      extensions: [],
    });
  }
}
