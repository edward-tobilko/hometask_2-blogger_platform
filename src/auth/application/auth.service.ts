import { log } from "node:console";

import { WithMeta } from "../../core/types/with-meta.type";
import { UsersQueryRepository } from "../../users/repositories/users-query.repository";
import { PasswordHasher } from "../adapters/bcrypt-hasher-service.adapter";
import { LoginAuthDtoCommand } from "./commands/login-auth-dto.command";
import { createToken } from "../../core/infrastructure/crypto/random-uuid.crypto";

class AuthService {
  constructor(
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<boolean> {
    const { loginOrEmail, password } = command.payload;

    const user = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      loginOrEmail,
      loginOrEmail
    );

    if (!user) return false;

    return this.passwordHasher.checkPassword(password, user.passwordHash);
  }

  async loginUser(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<{ accessToken: string } | null> {
    const isCorrectCredentials = await this.checkUserCredentials(command);

    if (!isCorrectCredentials) return null;

    log("token ->", createToken()); // c0a18733823b37e21e26c80ebc43dd7c29fad02861286f88bacdc0faa4daaf84

    return { accessToken: createToken() };
  }
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new PasswordHasher()
);
