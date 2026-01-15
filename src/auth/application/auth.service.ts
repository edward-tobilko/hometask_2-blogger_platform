import { log } from "node:console";
import { randomUUID } from "node:crypto";
import { add } from "date-fns";
import { ObjectId } from "mongodb";

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
import { AuthRepository } from "../repositories/auth.repository";
import { AuthDomain } from "../domain/auth.domain";
import { UserDB } from "db/types.db";
import { UserRepository } from "users/repositories/user.repository";
import { nodeMailerService } from "auth/adapters/nodemailer-service.adapter";
import { emailExamples } from "auth/adapters/email-examples.adapter";
import { parseDeviceTitle } from "auth/adapters/parser-device-service.adapter";

class AuthService {
  constructor(
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly passwordHasher: BcryptPasswordHasher,
    private readonly authRepo: AuthRepository,
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
          new UnauthorizedError("Your profile is not verified", "loginOrEmail"),
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

  async loginUser(
    command: WithMeta<LoginAuthDtoCommand>
  ): Promise<
    ApplicationResult<{ accessToken: string; refreshToken: string } | null>
  > {
    const result = await this.checkUserCredentials(command);

    if (result.status !== ApplicationResultStatus.Success) {
      return new ApplicationResult<{
        accessToken: string;
        refreshToken: string;
      } | null>({
        status: result.status, // NotFound or Unauthorized
        data: null,
        extensions: result.extensions, // loginOrEmail or password
      });
    }

    const userId = result.data!._id!.toString();
    const deviceId = randomUUID();

    const accessToken = await JWTService.createAccessToken(userId);
    const refreshToken = await JWTService.createRefreshToken(userId, deviceId);

    // * Получаем девайс с которого входит пользователь
    const userDeviceTitle = parseDeviceTitle(command.meta.userAgent!);

    // * создаём authMe из user и сохраняем в БД
    const authMe = AuthDomain.createMe(
      result.data!,
      deviceId,
      refreshToken,
      userDeviceTitle
    );

    await this.authRepo.saveAuthMe(authMe);

    log("accessToken from service (loginUser) ->", accessToken);
    log("refreshToken from service (loginUser) ->", refreshToken);
    log("[DEVICE_TITLE]", userDeviceTitle);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken, refreshToken },
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
    // * Если токен уже в черном списке — это либо повтор, либо атака
    const isBlackList = await AuthRepository.isBlackListed(oldRefreshToken);
    if (isBlackList) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });
    }

    const payload = await JWTService.verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });
    }

    const { userId, deviceId } = payload;

    // * проверка активной сессии (смотреть в browser -> application -> cookie -> session (the firth row)) в БД
    const session = await AuthRepository.findSession(
      new ObjectId(userId),
      deviceId
    );
    if (!session) {
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "session")],
      });
    }

    // * если в БД другой refreshToken → значит этот токен уже ротирован / украден / старый - базовый «reuse protection» через single valid token per session.
    if (session.refreshToken !== oldRefreshToken)
      return new ApplicationResult({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [new UnauthorizedError("Unauthorized", "refreshToken")],
      });

    // * заносим старый refresh в blacklist
    const expiredDate =
      JWTService.getRefreshTokenExpiresDate(oldRefreshToken) ??
      new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AuthRepository.addTokenToBlackList({
      refreshToken: oldRefreshToken,
      userId: new ObjectId(userId),
      deviceId,
      expiresAt: expiredDate,
      reason: "rotated",
    });

    // * создаем новую пару токенов
    const newAccessToken = await JWTService.createAccessToken(userId);
    const newRefreshToken = await JWTService.createRefreshToken(
      userId,
      deviceId
    );

    // * обновляем сессию в БД
    await AuthRepository.updateSessionRefreshToken(
      new ObjectId(userId),
      deviceId,
      {
        refreshToken: newRefreshToken,
        lastActiveDate: new Date(),
      }
    );

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      extensions: [],
    });
  }

  async getSession(userId: string, deviceId: string) {
    const session = await AuthRepository.findSession(
      new ObjectId(userId),
      deviceId
    );

    return session;
  }
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new BcryptPasswordHasher(),
  new AuthRepository(),
  new UserRepository()
);
