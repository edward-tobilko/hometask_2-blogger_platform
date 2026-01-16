import { BcryptPasswordHasher } from "./../../auth/adapters/bcrypt-hasher-service.adapter";
import { ApplicationResult } from "../../core/result/application.result";
import { WithMeta } from "../../core/types/with-meta.type";
import { UserRepository } from "../repositories/user.repository";
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
    const existedUserByEmail =
      await this.userQueryRepo.findByEmailQueryRepo(email);

    if (existedUserByEmail)
      throw new ValidationError("Email should be unique", "email", 422);

    const existedUserByLogin =
      await this.userQueryRepo.findByLoginQueryRepo(login);

    if (existedUserByLogin)
      throw new ValidationError("Login should be unique", "login", 422);

    // // * Если нужно возвращать обе ошибки сразу
    // const errors: ValidationError[] = [];

    // if (await this.userQueryRepo.findByLoginQueryRepo(login)) {
    //   errors.push(new ValidationError("Login should be unique", "login", 422));
    // }

    // if (await this.userQueryRepo.findByEmailQueryRepo(email)) {
    //   errors.push(new ValidationError("Email should be unique", "email", 422));
    // }

    // if (errors.length) throw errors;

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

  async deleteUser(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<boolean>> {
    const id = command.payload.id;

    const userId = await this.userQueryRepo.findUserByIdQueryRepo(id);

    if (!userId) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: false,
        extensions: [new NotFoundError("User is not found!", "userId")],
      });
    }

    const deleted = await this.userRepo.deleteUserRepo(id);

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

export const userService = new UserService();
