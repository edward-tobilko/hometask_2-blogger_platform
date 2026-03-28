import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import { LoginAuthDtoCommand } from "auth/application/commands/login-auth-dto.command";
import { UserEntity } from "users/domain/entities/user.entity";
import { UserDb } from "users/infrastructure/schemas/user-schema";

export interface IAuthService {
  checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<UserEntity>>;

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
  ): Promise<ApplicationResult<UserDb | null>>;

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

  confirmNewPasswordRecovery(
    newPassword: string,
    recoveryCode: string
  ): Promise<ApplicationResult<void>>;
}

// ? interface = абстракция
