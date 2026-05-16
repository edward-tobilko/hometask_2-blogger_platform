import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CreateUserInterface } from 'src/modules/user-accounts/domain/interfaces/create-user-interface';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import { CryptoService } from '../../services/crypto.service';
import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';
import { emailTemplates } from 'src/modules/user-accounts/infrastructure/external-services/email-templates.external-service';

export class RegisterUserCommand {
  constructor(public dto: { login: string; password: string; email: string }) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  void
> {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
    private mailerService: NodeMailerService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const existingUserByLogin = await this.usersRepo.findByLogin(dto.login);

    if (existingUserByLogin)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Already registered`,
        extensions: [new Extension('Already registered', 'login')], // just for status code 400 (bad request)
      });

    const existingUserByEmail = await this.usersRepo.findByEmail(dto.email);

    if (existingUserByEmail)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Already registered`,
        extensions: [new Extension('Already registered', 'email')], // just for status code 400 (bad request)
      });

    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const domainDto: CreateUserInterface = {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };

    try {
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
    } catch (error) {
      // * проверка на дубликат обьекта в бд: если обьект был удален, а мы хотим создать его с теме же полями (проблема soft delete + индекса).
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        const duplicatedField =
          'keyValue' in error && error.keyValue != null
            ? Object.keys(error.keyValue as object)[0]
            : 'loginOrEmail';

        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with this login or email already exists',
          extensions: [
            new Extension(
              'User with this login or email already exists',
              duplicatedField,
            ),
          ],
        });
      }

      throw error;
    }
  }
}
