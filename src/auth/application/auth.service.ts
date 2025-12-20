import { log } from "node:console";

import { WithMeta } from "../../core/types/with-meta.type";
import { UsersQueryRepository } from "../../users/repositories/users-query.repository";
import { PasswordHasher } from "../adapters/bcrypt-hasher-service.adapter";
import { LoginAuthDtoCommand } from "./commands/login-auth-dto.command";
import { createToken } from "../../core/infrastructure/crypto/random-uuid.crypto";
import { ApplicationResult } from "../../core/result/application.result";
import { UserDomain } from "../../users/domain/user.domain";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";

class AuthService {
  constructor(
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly passwordHasher: PasswordHasher
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
        extensions: [{ field: "loginOrEmail", message: "Not found" }],
        errorMessage: "User not found",
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
        extensions: [{ field: "password", message: "Invalid credentials" }],
      });
    }

    return new ApplicationResult<UserDomain>({
      status: ApplicationResultStatus.Success,
      data: user,
    });
  }

  async loginUser(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<{ accessToken: string } | null> {
    const isCorrectCredentials = await this.checkUserCredentials(command);

    if (!isCorrectCredentials) return null;

    const token = createToken();

    log("token from service (loginUser) ->", token); // b6c12d943338c4ad242ba2ee06af45a03dfda0aa0a6a335dd8d88c5d43fbfa70

    return { accessToken: token };
  }
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new PasswordHasher()
);
