import { randomUUID } from "node:crypto";
import { add } from "date-fns";
import { inject, injectable } from "inversify";
// import { Types as MongooseTypes } from "mongoose";

import { emailExamples } from "auth/infrastructure/external-api/email-templates";
import { parseDeviceName } from "auth/infrastructure/utils/device-parser.util";
import { getSessionExpirationDate } from "auth/domain/value-objects/get-session-expire-date";
import { IAuthService } from "auth/application/interfaces/auth-service.interface";
import { DiTypes } from "@core/di/types";
import { IUsersQueryRepository } from "users/application/interfaces/users-query-repo.interface";
import { IPasswordHasher } from "auth/application/interfaces/password-hasher.interface";
import { ISessionRepository } from "auth/application/interfaces/session-repo.interface";
import { ISessionQueryRepo } from "auth/application/interfaces/session-query-repo.interface";
import { IJWTService } from "auth/application/interfaces/jwt-service.interface";
import { IUsersRepository } from "users/application/interfaces/users-repo.interface";
import { INodeMailerService } from "auth/application/interfaces/node-mailer-service.interface";
import { UserDb } from "users/infrastructure/schemas/user-schema";
import { appConfig } from "@core/settings/config";
import { WithMeta } from "@core/types/with-meta.type";
import { LoginAuthDtoCommand } from "../commands/login-auth-dto.command";
import { ApplicationResult } from "@core/result/application.result";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import {
  ApplicationError,
  BadRequest,
  NotFoundError,
  UnauthorizedError,
} from "@core/errors/application.error";
import { UserEntity } from "users/domain/entities/user.entity";
import { SessionEntity } from "auth/domain/entities/session.entity";
import { UserMapper } from "users/domain/mappers/user.mapper";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(DiTypes.IUsersQueryRepository)
    private usersQueryRepo: IUsersQueryRepository,
    @inject(DiTypes.IPasswordHasher) private passwordHasher: IPasswordHasher,
    @inject(DiTypes.ISessionRepository) private sessionRepo: ISessionRepository,
    @inject(DiTypes.ISessionQueryRepo)
    private sessionQueryRepo: ISessionQueryRepo,
    @inject(DiTypes.IUsersRepository) private usersRepo: IUsersRepository,
    @inject(DiTypes.IJWTService) private jwtService: IJWTService,
    @inject(DiTypes.INodeMailerService)
    private nodeMailerService: INodeMailerService
  ) {}

  async checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<UserEntity | null>> {
    const { loginOrEmail, password } = command.payload;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginOrEmail);

    const userDoc = isEmail
      ? await this.usersQueryRepo.findByEmail(loginOrEmail)
      : await this.usersQueryRepo.findByLogin(loginOrEmail);

    if (!userDoc) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [
          new UnauthorizedError("Wrong credentials!", "loginOrEmail"),
        ],
      });
    }

    if (!userDoc.emailConfirmation.isConfirmed) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [
          new UnauthorizedError("Your profile is not verified", "isConfirmed"),
        ],
      });
    }

    const isPassCorrect = await this.passwordHasher.checkPassword(
      password,
      userDoc.passwordHash
    );

    if (!isPassCorrect) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Wrong password!", "password")],
      });
    }

    const userEntity = UserMapper.toDomain(userDoc);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: userEntity,
      extensions: [],
    });
  }

  async loginUser(command: WithMeta<LoginAuthDtoCommand>): Promise<
    ApplicationResult<{
      accessToken: string;
      refreshToken: string;
      sessionId: string;
      expiresAt: Date;
    } | null>
  > {
    const userResult = await this.checkUserCredentials(command);

    if (userResult.status !== ApplicationResultStatus.Success) {
      return new ApplicationResult<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        expiresAt: Date;
      } | null>({
        status: userResult.status, // NotFound or Unauthorized
        data: null,
        extensions: userResult.extensions, // loginOrEmail or password
      });
    }

    const user = userResult.data; // UserEntity

    if (!user) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new BadRequest("User is not found", "user")],
      });
    }

    const userId = user.id.toString();
    // const mongooseUserId = new MongooseTypes.ObjectId(userId);
    const deviceId = randomUUID();
    const sessionId = randomUUID();
    const ip = command.meta.ip ?? "0.0.0.0";

    // * Получаем девайс с которого входит пользователь
    const userDeviceName = parseDeviceName(
      command.meta.userAgent ?? "Unknown device"
    );

    const accessToken = await this.jwtService.createAccessToken(
      userId,
      deviceId
    );
    const refreshToken = await this.jwtService.createRefreshToken(
      userId,
      deviceId,
      sessionId
    );

    const refreshPayload =
      await this.jwtService.verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError()],
      });
    }

    const expiresAt =
      this.jwtService.getExpirationDate(refreshToken) ||
      getSessionExpirationDate(appConfig.RT_TIME ?? "7d");

    // * создаём authMe из user и сохраняем в БД
    const session = SessionEntity.saveMe({
      userId: user.id.toString(),
      login: user.login,

      deviceId,
      sessionId,
      userDeviceName,
      ip,
      expiresAt,

      refreshIat: refreshPayload.iat,
    });

    await this.sessionRepo.upsertLoginSession(session);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken, sessionId, expiresAt, refreshToken },
      extensions: [],
    });
  }

  async registerUser(
    login: string,
    password: string,
    email: string
  ): Promise<ApplicationResult<UserDb | null>> {
    const existingUserByLogin = await this.usersQueryRepo.findByLogin(login);

    const existingUserByEmail = await this.usersQueryRepo.findByEmail(email);

    // * проверяем существует ли уже юзер с таким логином или почтой, если да - не регистрировать
    if (existingUserByLogin) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("Already Registered", "login", 400)],
      });
    }

    if (existingUserByEmail) {
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("Already Registered", "email", 400)],
      });
    }

    const passwordHash = await this.passwordHasher.generateHash(password); // создать хэш пароля

    let newUser = UserEntity.createUser({
      login,
      password: passwordHash,
      email,
    });

    await this.usersRepo.createUser(newUser);

    // * отправку сообщения лучше обернуть в try-catch, чтобы при ошибке (например отвалиться отправка) приложение не падало
    try {
      await this.nodeMailerService.sendRegistrationConfirmationEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode!,
        emailExamples.registrationEmail
      );
    } catch (error: unknown) {
      console.error("EMAIL_SEND_ERROR", error);
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: newUser,
      extensions: [],
    });
  }

  async confirmRegistration(code: string): Promise<ApplicationResult<boolean>> {
    const userAccount =
      await this.usersQueryRepo.findUserByEmailAndNotConfirmCode(code);

    if (!userAccount)
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: false,
        extensions: [new BadRequest("Incorrect code", "code")],
      });

    if (userAccount.emailConfirmation.isConfirmed === true)
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: false,
        extensions: [new BadRequest("Email is confirmed", "code")],
      });

    if (
      userAccount.emailConfirmation.expirationDate &&
      userAccount.emailConfirmation.expirationDate < new Date()
    )
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: false,
        extensions: [
          new BadRequest(
            "Expiration date of confirmation code is ended",
            "code"
          ),
        ],
      });

    const updatedResultConfirmStatus =
      await this.usersRepo.updateEmailUserConfirmationStatus(userAccount._id!);

    if (!updatedResultConfirmStatus) {
      return new ApplicationResult({
        status: ApplicationResultStatus.InternalServerError,
        data: false,
        extensions: [new ApplicationError("Cannot confirm user", "code")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: true,
      extensions: [],
    });
  }

  async resendRegistrationEmail(
    email: string
  ): Promise<ApplicationResult<null>> {
    const userAccount = await this.usersQueryRepo.findByEmail(email);

    if (!userAccount)
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("This user does not exist", "email")],
      });

    if (userAccount.emailConfirmation.isConfirmed)
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("Email is confirmed", "email")],
      });

    // * Генерируем новый код и новый дедлайн
    const newCode = randomUUID();
    const newExp = add(new Date(), { hours: 1, minutes: 3 });

    const updated = await this.usersRepo.updateEmailUserConfirmation(
      userAccount._id!,
      {
        confirmationCode: newCode,
        expirationDate: newExp,
        isConfirmed: false,
      }
    );

    if (!updated) {
      return new ApplicationResult({
        status: ApplicationResultStatus.InternalServerError,
        data: null,
        extensions: [
          new ApplicationError("Cannot update confirmation data", "email", 500),
        ],
      });
    }

    this.nodeMailerService
      .sendRegistrationConfirmationEmail(
        email,
        newCode,
        emailExamples.registrationEmail
      )
      .catch((error: unknown) => console.error("EMAIL_SEND_ERROR", error));

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }

  async getRefreshTokens(
    oldRefreshToken: string
  ): Promise<
    ApplicationResult<{ accessToken: string; refreshToken: string } | null>
  > {
    const payload = await this.jwtService.verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });
    }

    const { userId, deviceId, sessionId, iat } = payload;

    // * проверка активной сессии (смотреть в browser -> application -> cookie -> session (the firth row)) в БД
    const session = await this.sessionQueryRepo.findBySessionId(sessionId);
    if (!session) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "session")],
      });
    }

    // * если в БД другой refreshToken → значит этот токен уже ротирован / украден / старый - базовый «reuse protection» через single valid token per session.
    if (session.userId.toString() !== userId)
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });

    if (session.deviceId !== deviceId)
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });

    // * rotation guard (в session в бд должно быть поле refreshIat: number)
    if (session.refreshIat !== iat) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });
    }

    await this.sessionRepo.updateLastActiveDate(sessionId);

    // * создаем новую пару токенов
    const newAccessToken = await this.jwtService.createAccessToken(userId);
    const newRefreshToken = await this.jwtService.createRefreshToken(
      userId,
      deviceId,
      sessionId
    );

    // * получаем iat нового refresh и сохраняем в сессию -> старый становится недействительным
    const newPayload =
      await this.jwtService.verifyRefreshToken(newRefreshToken);
    if (!newPayload) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });
    }

    const updated = await this.sessionRepo.updateRefreshIat(
      sessionId,
      newPayload.iat
    );

    if (!updated) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "session")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      extensions: [],
    });
  }

  async logout(sessionId: string): Promise<ApplicationResult<boolean>> {
    const deleted = await this.sessionRepo.deleteBySessionId(sessionId);

    if (!deleted) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: false,
        extensions: [new NotFoundError("Session is not found")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: true,
      extensions: [],
    });
  }

  async refreshTokens(oldRefreshToken: string): Promise<
    ApplicationResult<{
      userId: string;
      newAccessToken: string;
      newRefreshToken: string;
    } | null>
  > {
    // * Проверяем refresh token и получаем userId
    const refreshPayload =
      await this.jwtService.verifyRefreshToken(oldRefreshToken);

    if (!refreshPayload)
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("No Unauthorized")],
      });

    const userId = refreshPayload.userId;

    // * Создаем новые токены
    const newAccessToken = await this.jwtService.createAccessToken(userId);
    const newRefreshToken = await this.jwtService.createRefreshToken(
      userId,
      refreshPayload.deviceId,
      refreshPayload.sessionId
    );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { userId, newAccessToken, newRefreshToken },
      extensions: [],
    });
  }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersQueryRepo.findByEmail(email);

    // * не палим, что email не существует
    if (!user) return;

    // * Генерируем новый код и новый дедлайн
    const recoveryCode = randomUUID();
    const newExpDate = add(new Date(), { hours: 1, minutes: 3 });

    await this.usersRepo.sendRecoveryPasswordEmail(user._id!, {
      recoveryCode,
      expirationDate: newExpDate,
    });

    try {
      await this.nodeMailerService.sendRecoveryPasswordEmail(
        email,
        recoveryCode,
        emailExamples.passwordRecoveryEmail
      );
    } catch (error: unknown) {
      console.error("EMAIL_SEND_ERROR", error);
    }
  }

  async confirmNewPasswordRecovery(
    newPassword: string,
    recoveryCode: string
  ): Promise<ApplicationResult<void>> {
    const user = await this.usersQueryRepo.findUserByRecoveryCode(
      recoveryCode!
    );

    const info = user?.recoveryPasswordInfo;

    if (
      !user?._id ||
      !info?.recoveryCode ||
      !info.expirationDate ||
      info.recoveryCode !== recoveryCode ||
      info.expirationDate.getTime() < Date.now()
    )
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [
          new ApplicationError(
            "RecoveryCode is incorrect or expired",
            "recoveryCode"
          ),
        ],
      });

    const passwordHash = await this.passwordHasher.generateHash(newPassword);

    await this.usersRepo.updatePasswordAndClearRecovery(user._id, passwordHash);

    return new ApplicationResult({
      status: ApplicationResultStatus.NoContent,
      data: undefined,
      extensions: [],
    });
  }
}
