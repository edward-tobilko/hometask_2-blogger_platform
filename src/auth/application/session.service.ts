import { randomUUID } from "node:crypto";
import { add } from "date-fns";
import { inject, injectable } from "inversify";
import { Types as MongooseTypes } from "mongoose";

import { WithMeta } from "../../core/types/with-meta.type";
import { LoginAuthDtoCommand } from "./commands/login-auth-dto.command";
import { ApplicationResult } from "../../core/result/application.result";
import { UserDomain } from "../../users/domain/user.domain";
import { ApplicationResultStatus } from "../../core/result/types/application-result-status.enum";
import {
  ApplicationError,
  BadRequest,
  NotFoundError,
  UnauthorizedError,
} from "../../core/errors/application.error";
import { emailExamples } from "auth/adapters/email-examples.adapter";
import { parseDeviceName } from "auth/helpers/parser-device-name.helper";
import { getSessionExpirationDate } from "auth/helpers/get-session-expire-date.helper";
import { IAuthService } from "auth/interfaces/IAuthService";
import { Types } from "@core/di/types";
import { IUsersQueryRepository } from "users/interfaces/IUsersQueryRepository";
import { IPasswordHasher } from "auth/interfaces/IPasswordHasher";
import { ISessionRepository } from "auth/interfaces/ISessionRepository";
import { ISessionQueryRepo } from "auth/interfaces/ISessionQueryRepo";
import { IJWTService } from "auth/interfaces/IJWTService";
import { IUsersRepository } from "users/interfaces/IUsersRepository";
import { INodeMailerService } from "auth/interfaces/INodeMailerService";
import { UserDb, UserReadModelType } from "users/mongoose/user-schema.mongoose";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(Types.IUsersQueryRepository)
    private usersQueryRepo: IUsersQueryRepository,
    @inject(Types.IPasswordHasher) private passwordHasher: IPasswordHasher,
    @inject(Types.ISessionRepository) private sessionRepo: ISessionRepository,
    @inject(Types.ISessionQueryRepo)
    private sessionQueryRepo: ISessionQueryRepo,
    @inject(Types.IUsersRepository) private usersRepo: IUsersRepository,
    @inject(Types.IJWTService) private jwtService: IJWTService,
    @inject(Types.INodeMailerService)
    private nodeMailerService: INodeMailerService
  ) {}

  async checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<UserReadModelType>> {
    const { loginOrEmail, password } = command.payload;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginOrEmail);

    const user = isEmail
      ? await this.usersQueryRepo.findByEmail(loginOrEmail)
      : await this.usersQueryRepo.findByLogin(loginOrEmail);

    if (!user) {
      return new ApplicationResult<UserReadModelType>({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [
          new UnauthorizedError("Wrong credentials!", "loginOrEmail"),
        ],
      });
    }

    if (!user.emailConfirmation.isConfirmed) {
      return new ApplicationResult<UserReadModelType>({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [
          new UnauthorizedError("Your profile is not verified", "isConfirmed"),
        ],
      });
    }

    const isPassCorrect = await this.passwordHasher.checkPassword(
      password,
      user.passwordHash
    );

    if (!isPassCorrect) {
      return new ApplicationResult<UserReadModelType>({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Wrong password!", "password")],
      });
    }

    return new ApplicationResult<UserReadModelType>({
      status: ApplicationResultStatus.Success,
      data: user,
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

    const user = userResult.data!; // UserDomain

    const userId = user!._id.toString();
    const mongooseUserId = new MongooseTypes.ObjectId(userId);
    const deviceId = randomUUID();
    const sessionId = randomUUID();
    const ip = command.meta.ip ?? "0.0.0.0";

    // * Получаем девайс с которого входит пользователь
    const userDeviceName = parseDeviceName(
      command.meta.userAgent ?? "Unknown device"
    );

    const accessToken = await this.jwtService.createAccessToken(userId);
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
      getSessionExpirationDate(30_000);

    // // * создаём authMe из user и сохраняем в БД
    // const session = SessionDomain.saveMe({
    //   userId: user.id!.toString(),
    //   login: user.login,

    //   deviceId,
    //   sessionId,
    //   userDeviceName,
    //   ip,
    //   expiresAt,

    //   refreshIat: refreshPayload.iat,
    // });

    await this.sessionRepo.upsertLoginSession({
      userId: mongooseUserId,
      login: user.login,

      sessionId,
      deviceId,
      ip,
      userDeviceName,
      refreshToken,

      lastActiveDate: new Date(),
      expiresAt,
      // createdAt: new Date(), // автоматически создат нам монгус в schema -> timestamps = true
      refreshIat: refreshPayload.iat,
    });

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

    let newUser = UserDomain.createUser({
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
