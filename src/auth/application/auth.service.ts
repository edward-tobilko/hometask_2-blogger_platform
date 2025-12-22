import { log } from "node:console";

import { WithMeta } from "../../core/types/with-meta.type";
import { UsersQueryRepository } from "../../users/repositories/users-query.repository";
import { BcryptPasswordHasher } from "../adapters/bcrypt-hasher-service.adapter";
import { LoginAuthDtoCommand } from "./commands/login-auth-dto.command";
import { ApplicationResult } from "../../core/result/application.result";
import { UserDomain } from "../../users/domain/user.domain";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import {
  NotFoundError,
  UnauthorizedError,
} from "../../core/errors/application.error";
import { jwtService } from "../adapters/jwt-service.adapter";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthDomain } from "../domain/auth.domain";

class AuthService {
  constructor(
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
    private readonly authRepo: AuthRepository
  ) {}

  async checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<UserDomain>> {
    const { loginOrEmail, password } = command.payload;

    const user = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      loginOrEmail,
      loginOrEmail
    );

    if (!user) {
      return new ApplicationResult<UserDomain>({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("loginOrEmail", "User is not found!")],
      });
    }

    const isPassCorrect = await this.passwordHasher.checkPassword(
      password,
      user.passwordHash
    );

    if (!isPassCorrect) {
      return new ApplicationResult<UserDomain>({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("password", "Wrong password!")],
      });
    }

    return new ApplicationResult<UserDomain>({
      status: ApplicationResultStatus.Success,
      data: user,
      extensions: [],
    });
  }

  async loginUser(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<{ accessToken: string } | null>> {
    const result = await this.checkUserCredentials(command);

    log("result ->", result);

    if (result.status !== ApplicationResultStatus.Success) {
      return new ApplicationResult<{ accessToken: string } | null>({
        status: result.status, // NotFound or Unauthorized
        data: null,
        extensions: result.extensions, // loginOrEmail or password
      });
    }

    const accessToken = await jwtService.createAccessToken(
      result.data!._id!.toString()
    );

    // * создаём authMe из user и сохраняем
    const authMe = AuthDomain.createMe(result.data!);

    await this.authRepo.saveAuthMe(authMe);

    log("token from service (loginUser) ->", accessToken); // b6c12d943338c4ad242ba2ee06af45a03dfda0aa0a6a335dd8d88c5d43fbfa70

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken },
      extensions: [],
    });
  }
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new BcryptPasswordHasher(),
  new AuthRepository()
);
