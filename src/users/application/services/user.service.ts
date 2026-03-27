import { inject, injectable } from "inversify";

import { ApplicationResult } from "../../../core/result/application.result";
import { WithMeta } from "../../../core/types/with-meta.type";
import { CreateUserDtoCommand } from "../commands/user-dto.commands";
import { UserOutput } from "../output/user.output";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";
import {
  NotFoundError,
  ValidationError,
} from "../../../core/errors/application.error";
import { IUsersService } from "users/application/interfaces/users-service.interface";
import { DiTypes } from "@core/di/types";
import { IUsersRepository } from "users/application/interfaces/users-repo.interface";
import { IUsersQueryRepository } from "users/application/interfaces/users-query-repo.interface";
import { IPasswordHasher } from "auth/interfaces/IPasswordHasher";
import { UserDtoDomain } from "users/domain/value-objects/user-dto.domain";
import { UserEntity } from "users/domain/entities/user.entity";
import { UserMapper } from "users/domain/mappers/user.mapper";

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
  ): Promise<ApplicationResult<UserOutput | null>> {
    const { email, password, login } = command.payload;

    // * Проверка уникальности login / email в BLL
    const existedUserByEmail = await this.usersQueryRepo.findByEmail(email);

    if (existedUserByEmail) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotAllowed,
        data: null,
        extensions: [
          new ValidationError("Email should be unique", "email", 422),
        ],
      });
    }

    const existedUserByLogin = await this.usersQueryRepo.findByLogin(login);

    if (existedUserByLogin) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotAllowed,
        data: null,
        extensions: [
          new ValidationError("login should be unique", "login", 422),
        ],
      });
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
    const newUser = UserEntity.createAdminUser(domainDto);

    // * Сохраняем в репозитории
    const createdUser = await this.usersRepo.createUser(newUser);

    const userOutput = UserMapper.toViewModel(createdUser);

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
