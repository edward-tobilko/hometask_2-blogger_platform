import { log } from "node:console";
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
  UnauthorizedError,
} from "../../core/errors/application.error";
import { JWTService } from "../adapters/jwt-service.adapter";
import { SessionDomain } from "../domain/session.domain";
import { UserDB } from "db/types.db";
import { UserRepository } from "users/repositories/user.repository";
import { nodeMailerService } from "auth/adapters/nodemailer-service.adapter";
import { emailExamples } from "auth/adapters/email-examples.adapter";
import { parseDeviceName } from "auth/adapters/parser-device-service.adapter";
import { getSessionExpireDate } from "auth/helpers/get-session-expire-date.helper";
import { SessionRepository } from "auth/repositories/session.repository";

class AuthService {
  constructor(
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
    private readonly sessionRepo: SessionRepository,
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
      sessionId: string;
      expiresAt: Date;
    } | null>
  > {
    const userResult = await this.checkUserCredentials(command);

    if (userResult.status !== ApplicationResultStatus.Success) {
      return new ApplicationResult<{
        accessToken: string;
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
    const sessionId = randomUUID(); // то, что мы помещаем в cookie refreshToken
    const ip = command.meta.ip ?? "0.0.0.0";

    const accessToken = await JWTService.createAccessToken(userId);

    // * Получаем девайс с которого входит пользователь
    const userDeviceName = parseDeviceName(
      command.meta.userAgent ?? "Unknown device"
    );

    const expiresAt = getSessionExpireDate(30_000);

    // * создаём authMe из user и сохраняем в БД
    const session = SessionDomain.saveMe(userResult.data!, {
      deviceId,
      sessionId,
      userDeviceName,
      ip,
      expiresAt,
    });

    await this.sessionRepo.upsertLoginSession(session);

    log("accessToken from service (loginUser) ->", accessToken);
    log("sessionId from service (loginUser) ->", sessionId);
    log("[DEVICE_NAME]", userDeviceName);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken, sessionId, expiresAt },
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

    const { userId, deviceId, sessionId } = payload;

    // * проверка активной сессии (смотреть в browser -> application -> cookie -> session (the firth row)) в БД
    const session = await this.sessionRepo.findBySessionId(sessionId);
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

    await this.sessionRepo.updateLastActiveDate(sessionId);

    // * создаем новую пару токенов
    const newAccessToken = await JWTService.createAccessToken(userId);
    const newRefreshToken = await JWTService.createRefreshToken(
      userId,
      deviceId,
      sessionId
    );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      extensions: [],
    });
  }

  async getSession(sessionId: string) {
    const session = await this.sessionRepo.findBySessionId(sessionId);

    return session;
  }
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new BcryptPasswordHasher(),
  new SessionRepository(),
  new UserRepository()
);
