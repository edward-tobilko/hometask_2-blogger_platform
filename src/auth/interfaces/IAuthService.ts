import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import { LoginAuthDtoCommand } from "auth/application/commands/login-auth-dto.command";
import { UserDB } from "db/types.db";
import { UserDomain } from "users/domain/user.domain";

export interface IAuthService {
  checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<UserDomain>>;

  loginUser(command: WithMeta<LoginAuthDtoCommand>): Promise<
    ApplicationResult<{
      accessToken: string;
      refreshToken: string;
      sessionId: string;
      expiresAt: Date;
    } | null>
  >;

  registerUser(
    login: string,
    password: string,
    email: string
  ): Promise<ApplicationResult<UserDB | null>>;

  confirmRegistration(code: string): Promise<ApplicationResult<boolean>>;

  resendRegistrationEmail(email: string): Promise<ApplicationResult<null>>;

  getRefreshTokens(
    oldRefreshToken: string
  ): Promise<
    ApplicationResult<{ accessToken: string; refreshToken: string } | null>
  >;

  logout(sessionId: string): Promise<ApplicationResult<boolean>>;

  refreshTokens(oldRefreshToken: string): Promise<
    ApplicationResult<{
      userId: string;
      newAccessToken: string;
      newRefreshToken: string;
    } | null>
  >;

  passwordRecovery(email: string): Promise<void>;
}
