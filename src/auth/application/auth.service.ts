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
  NotFoundError,
  UnauthorizedError,
} from "../../core/errors/application.error";
import { JWTService } from "../adapters/jwt-service.adapter";
import { AuthRepository } from "../repositories/auth.repository";
import { AuthDomain } from "../domain/auth.domain";
import { UserDB } from "db/types.db";
import { UserRepository } from "users/repositories/user.repository";
import { nodeMailerService } from "auth/adapters/nodemailer-service.adapter";
import { emailExamples } from "auth/adapters/email-examples.adapter";

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

    const user = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      loginOrEmail,
      loginOrEmail
    );

    if (!user) {
      return new ApplicationResult<UserDomain>({
        status: ApplicationResultStatus.Unauthorized,
        data: null,
        extensions: [
          new UnauthorizedError("Wrong credentials!", "loginOrEmail"),
        ],
      });
    }

    if (!user.emailConfirmation.isConfirmed)
      throw new ApplicationError("Your profile is not verified", "code", 400);

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
  ): Promise<ApplicationResult<{ accessToken: string } | null>> {
    const result = await this.checkUserCredentials(command);

    if (result.status !== ApplicationResultStatus.Success) {
      return new ApplicationResult<{ accessToken: string } | null>({
        status: result.status, // NotFound or Unauthorized
        data: null,
        extensions: result.extensions, // loginOrEmail or password
      });
    }

    const accessToken = await JWTService.createAccessToken(
      result.data!._id!.toString()
    );

    // * создаём authMe из user и сохраняем
    const authMe = AuthDomain.createMe(result.data!);

    await this.authRepo.saveAuthMe(authMe);

    log("token from service (loginUser) ->", accessToken); // b6c12d943338c4ad242ba2ee06af45a03dfda0aa0a6a335dd8d88c5d43fbfa70

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: { accessToken },
      extensions: [],
    });
  }

  async registerUser(
    login: string,
    password: string,
    email: string
  ): Promise<ApplicationResult<UserDB | null>> {
    const existingUser = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      login,
      email
    );

    // * проверяем существует ли уже юзер с таким логином или почтой и если да - не регистрировать
    if (existingUser) {
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
      nodeMailerService.sendRegistrationConfirmationEmail(
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

    if (userAccount.emailConfirmation.isConfirmed)
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: false,
        extensions: [new BadRequest("Email is confirmed", "code")],
      });

    if (userAccount.emailConfirmation.expirationDate < new Date())
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
    const userAccount = await this.userQueryRepo.findByLoginOrEmailQueryRepo(
      undefined,
      email
    );

    if (!userAccount)
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("This user does not exist", "code")],
      });

    if (userAccount.emailConfirmation.isConfirmed)
      return new ApplicationResult({
        status: ApplicationResultStatus.BadRequest,
        data: null,
        extensions: [new ApplicationError("Email is confirmed", "code")],
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

    try {
      await nodeMailerService.sendRegistrationConfirmationEmail(
        email,
        newCode,
        emailExamples.registrationEmail
      );
    } catch (error: unknown) {
      console.error("EMAIL_SEND_ERROR", error);
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: null,
      extensions: [],
    });
  }
}

// * способ для production: легче писать тесты (можно подсунуть мок репозитория/хешера) и более гибко менять реализации (например, другой хэшер).
export const authService = new AuthService(
  new UsersQueryRepository(),
  new BcryptPasswordHasher(),
  new AuthRepository(),
  new UserRepository()
);
