import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from './crypto.service';
import { CreateUserInterface } from '../../domain/interfaces/create-user-interface';
import { NodeMailerService } from '../../infrastructure/external-services/mailer.external-service';
import { emailTemplates } from '../../infrastructure/external-services/email-templates.external-service';
import { UserSessionViewDto } from '../../api/view-dto/user-session.view-dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
    private mailerService: NodeMailerService,
    private jwtService: JwtService,
  ) {}

  login(userId: string): { accessToken: string } {
    const accessToken = this.jwtService.sign({ userId });

    return { accessToken };
  }

  async registerUser(
    login: string,
    password: string,
    email: string,
  ): Promise<void> {
    const existingUserByLoginOrEmail =
      await this.usersRepo.findUserByLoginOrEmail(login, email);

    if (existingUserByLoginOrEmail)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Already registered`,
        extensions: [new Extension('Already registered', 'loginOrEmail')], // just for status code 400 (bad request)
      });

    const passwordHash = await this.cryptoService.generateHash(password);

    const domainDto: CreateUserInterface = {
      login,
      email,
      passwordHash,
    };

    const newUser = await this.usersRepo.create(domainDto);

    try {
      await this.mailerService.sendRegistrationConfirmationEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode!,
        (code: string) => emailTemplates.registrationEmail(code),
      );
    } catch (error: unknown) {
      // * письмо не отправилось — удаляем пользователя, откатываем регистрацию
      await this.usersRepo.delete(newUser.id);

      console.error('EMAIL_SEND_ERROR', error);

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Failed to send confirmation email. Please try again.',
      });
    }
  }

  async setConfirmRegister(code: string): Promise<void> {
    const userAccount = await this.usersRepo.findByConfirmationCode(code);

    if (!userAccount)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Incorrect code',
        extensions: [new Extension('Incorrect code', 'code')],
      });

    userAccount.sendConfirmEmail(code);

    await this.usersRepo.save(userAccount);
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with this email does not exist',
        extensions: [
          new Extension('User with this email does not exist', 'email'),
        ],
      });

    user.resendConfirmationCode();

    await this.mailerService.sendRegistrationConfirmationEmail(
      user.email,
      user.emailConfirmation.confirmationCode!,
      (code: string) => emailTemplates.registrationEmail(code),
    );

    await this.usersRepo.save(user);
  }
  async sendPasswordRecovery(email: string): Promise<void> {
    const user = await this.usersRepo.findByEmail(email);

    if (!user) return; // не раскрываем факт существования email

    user.setPasswordRecoveryCode();

    // * по контракту нужно всегда возвращать 204, при ошибке не раскрывая деталей существования email
    try {
      await this.mailerService.sendRegistrationConfirmationEmail(
        user.email,
        user.passwordRecovery.recoveryCode!,
        (code: string) => emailTemplates.passwordRecoveryEmail(code),
      );

      await this.usersRepo.save(user);
    } catch (error) {
      console.error('EMAIL_SEND_ERROR', error);

      return; // тихо возвращаем void, клиент получает 204
    }
  }

  async setNewPassword(dto: {
    newPassword: string;
    recoveryCode: string;
  }): Promise<void> {
    const user = await this.usersRepo.findByRecoveryCode(dto.recoveryCode);

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect',
        extensions: [
          new Extension('Recovery code is incorrect', 'recoveryCode'),
        ],
      });

    const passwordHash = await this.cryptoService.generateHash(dto.newPassword);

    user.setNewPassword(passwordHash);

    await this.usersRepo.save(user);
  }

  async getMe(userId: string): Promise<any> {
    const user = await this.usersRepo.findById(userId);

    // * проверку можно не делать, так как в контроллере -> JwtAuthGuard гард ее делает

    const userSessionView: UserSessionViewDto = {
      email: user!.email,
      login: user!.login,
      userId: user!.id,
    };

    return userSessionView;
  }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string } | null> {
    const user = await this.usersRepo.findUserByLoginOrEmail(
      loginOrEmail,
      loginOrEmail,
    );

    if (!user) return null;

    const isValidPass = await this.cryptoService.compareHash(
      password,
      user.passwordHash,
    );

    if (!isValidPass) return null;

    return { id: user.id.toString() };
  }
}
