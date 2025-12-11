import { WithMeta } from "../../core/types/with-meta.type";
import { UsersQueryRepository } from "../../users/repositories/users-query.repository";
import { PasswordHasher } from "../adapters/bcrypt-hasher-service.adapter";
import { LoginAuthDtoCommand } from "./commands/login-auth-dto.command";

class AuthService {
  private userQueryRepo: UsersQueryRepository;
  private passwordHasher: PasswordHasher;

  constructor() {
    this.userQueryRepo = new UsersQueryRepository();
    this.passwordHasher = new PasswordHasher();
  }
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

    return { accessToken: "token" };
  }
}

export const authService = new AuthService();
