import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from './crypto.service';
import { CreateUserInterface } from '../../domain/interfaces/create-user-interface';
import { NodeMailerService } from '../../infrastructure/external-services/mailer.external-service';
import { emailTemplates } from '../../infrastructure/external-services/email-templates.external-service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
    private mailerService: NodeMailerService,
  ) {}

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

  async validateUser(
    login: string,
    password: string,
  ): Promise<{ id: string } | null> {
    const user = await this.usersRepo.findByLogin(login);

    if (!user) return null;

    const validPassword = password;

    if (!validPassword) return null;

    return { id: user.id.toString() };
  }
}
