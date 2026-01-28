import { randomUUID } from "node:crypto";
import { add } from "date-fns";

import { WithMeta } from "../../core/types/with-meta.type";
import { UsersQueryRepository } from "../../users/repositories/users-query.repository";
import { BcryptPasswordHasher } from "../adapters/bcrypt-hasher-service.adapter";
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
import { JWTService } from "../adapters/jwt-service.adapter";
import { SessionDomain } from "../domain/session.domain";
import { UserDB } from "db/types.db";
import { UserRepository } from "users/repositories/user.repository";
import { nodeMailerService } from "auth/adapters/nodemailer-service.adapter";
import { emailExamples } from "auth/adapters/email-examples.adapter";
import { parseDeviceName } from "auth/helpers/parser-device-name.helper";
import { getSessionExpirationDate } from "auth/helpers/get-session-expire-date.helper";
import { SessionRepository } from "auth/repositories/session.repository";
import { SessionQueryRepo } from "auth/repositories/session-query.repo";

class AuthService {
  constructor(
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
    private readonly sessionRepo: SessionRepository,
    private readonly sessionQueryRepo: SessionQueryRepo,
    private readonly userRepo: UserRepository
  ) {}

  async checkUserCredentials(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<ApplicationResult<UserDomain>> {
    const { loginOrEmail, password } = command.payload;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginOrEmail);

    const user = isEmail
      ? await this.userQueryRepo.findByEmailQueryRepo(loginOrEmail)
      : await this.userQueryRepo.findByLoginQueryRepo(loginOrEmail);

    if (!user) {
      return new ApplicationResult<UserDomain>({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [
          new UnauthorizedError("Wrong credentials!", "loginOrEmail"),
        ],
      });
    }

    if (!user.emailConfirmation.isConfirmed) {
      return new ApplicationResult<UserDomain>({
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
      return new ApplicationResult<UserDomain>({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Wrong password!", "password")],
      });
    }

    return new ApplicationResult<UserDomain>({
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

    const userId = userResult.data!._id!.toString();
    const deviceId = randomUUID();
    const sessionId = randomUUID();
    const ip = command.meta.ip ?? "0.0.0.0";

    // * Получаем девайс с которого входит пользователь
    const userDeviceName = parseDeviceName(
      command.meta.userAgent ?? "Unknown device"
    );

    const accessToken = await JWTService.createAccessToken(userId);
    const refreshToken = await JWTService.createRefreshToken(
      userId,
      deviceId,
      sessionId
    );

    const refreshPayload = await JWTService.verifyRefreshToken(refreshToken);
    if (!refreshPayload) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError()],
      });
    }

    const expiresAt =
      JWTService.getExpirationDate(refreshToken) ||
      getSessionExpirationDate(30_000);

    // * создаём authMe из user и сохраняем в БД
    const session = SessionDomain.saveMe(userResult.data!, {
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
  ): Promise<ApplicationResult<UserDB | null>> {
    const existingUserByLogin =
      await this.userQueryRepo.findByLoginQueryRepo(login);

    const existingUserByEmail =
      await this.userQueryRepo.findByEmailQueryRepo(email);

    // * проверяем существует ли уже юзер с таким логином или почтой и если да - не регистрировать
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

    await this.userRepo.createUserRepo(newUser);

    // * отправку сообщения лучше обернуть в try-catch, чтобы при ошибке (например отвалиться отправка) приложение не падало
    try {
      await nodeMailerService.sendRegistrationConfirmationEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
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
      await this.userQueryRepo.findUserByEmailAndNotConfirmCodeQueryRepo(code);

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
      await this.userRepo.updateEmailUserConfirmationStatus(userAccount._id!);

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
    const userAccount = await this.userQueryRepo.findByEmailQueryRepo(email);

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

    const updated = await this.userRepo.updateEmailUserConfirmation(
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

    nodeMailerService
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
    const payload = await JWTService.verifyRefreshToken(oldRefreshToken);
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
    if (session.userId.toString() !== userId || session.deviceId !== deviceId)
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });

    // * rotation guard (в session должно быть поле refreshIat: number)
    if (session.refreshIat !== iat) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });
    }

    await this.sessionRepo.updateLastActiveDate(sessionId);

    // * создаем новую пару токенов
    const newAccessToken = await JWTService.createAccessToken(userId);
    const newRefreshToken = await JWTService.createRefreshToken(
      userId,
      deviceId,
      sessionId
    );

    // * получаем iat нового refresh и сохраняем в сессию -> старый становится недействительным
    const newPayload = await JWTService.verifyRefreshToken(newRefreshToken);
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
    const refreshPayload = await JWTService.verifyRefreshToken(oldRefreshToken);

    if (!refreshPayload)
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("No Unauthorized")],
      });

    const userId = refreshPayload.userId;

    // * Создаем новые токены
    const newAccessToken = await JWTService.createAccessToken(userId);
    const newRefreshToken = await JWTService.createRefreshToken(
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
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new BcryptPasswordHasher(),
  new SessionRepository(),
  new SessionQueryRepo(),
  new UserRepository()
);
