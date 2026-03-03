import { inject, injectable } from "inversify";

import { ApplicationResult } from "../../core/result/application.result";
import { WithMeta } from "../../core/types/with-meta.type";
import { CreateUserDtoCommand } from "./commands/user-dto.commands";
import { UserOutput } from "./output/user.output";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import {
  NotFoundError,
  ValidationError,
} from "../../core/errors/application.error";
import { IUsersService } from "users/interfaces/IUsersService";
import { DiTypes } from "@core/di/types";
import { IUsersRepository } from "users/interfaces/IUsersRepository";
import { IUsersQueryRepository } from "users/interfaces/IUsersQueryRepository";
import { IPasswordHasher } from "auth/interfaces/IPasswordHasher";
import { UserDb } from "users/mongoose/user-schema.mongoose";

@injectable()
export class UsersService implements IUsersService {
  constructor(
    @inject(DiTypes.IUsersRepository) private usersRepo: IUsersRepository,
    @inject(DiTypes.IUsersQueryRepository)
    private usersQueryRepo: IUsersQueryRepository,
    @inject(DiTypes.IPasswordHasher) private passwordHasher: IPasswordHasher
  ) {}

  async createUser(
    command: WithMeta<CreateUserDtoCommand>
  ): Promise<ApplicationResult<UserOutput>> {
    const dto = command.payload;

    const { email, password, login } = dto;

    // * Проверка уникальности login / email в BLL
    const existedUserByEmail = await this.usersQueryRepo.findByEmail(email);

    if (existedUserByEmail)
      throw new ValidationError("Email should be unique", "email", 422);

    const existedUserByLogin = await this.usersQueryRepo.findByLogin(login);

    if (existedUserByLogin)
      throw new ValidationError("Login should be unique", "login", 422);

    // * Генерация хеша пароля
    const hash = await this.passwordHasher.generateHash(password);

    const userDb: UserDb = {
      login,
      email,
      createdAt: new Date(),
      passwordHash: hash,

      emailConfirmation: {
        confirmationCode: "",
        expirationDate: null,
        isConfirmed: true,
      },

      recoveryPasswordInfo: null,
    };

    // // * DTO для доменной модели
    // const domainDto: UserDtoDomain = {
    //   login,
    //   password: hash,
    //   email,
    // };

    // // * Создаем доменный обьект
    // const newUser = UserDomain.createAdminUser(domainDto);

    // // * Сохраняем в репозитории
    const createdUser = await this.usersRepo.createUser(userDb);

    const userOutput: UserOutput = {
      id: createdUser._id!.toString(),
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt.toISOString(),
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

    const userId = await this.usersQueryRepo.findUserById(id);

    if (!userId) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: false,
        extensions: [new NotFoundError("User is not found!", "userId")],
      });
    }

    const deleted = await this.usersRepo.deleteUser(id);

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
