import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CreateUserDomainDto } from 'src/modules/user-accounts/domain/dto/create-user.dto';
import { CryptoService } from '../../services/crypto.service';
import { UserRegisteredEvent } from 'src/modules/user-accounts/domain/events/user-registered.event';
import { UsersService } from '../../services/users.service';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/repositories/users-sql.repository';

export class RegisterUserCommand {
  constructor(public dto: { login: string; password: string; email: string }) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  void
> {
  constructor(
    private eventBus: EventBus,
    private usersService: UsersService,
    private usersRepo: UsersSqlRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    await this.usersService.ensureLoginAndEmailUnique(dto.login, dto.email);

    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const domainDto: CreateUserDomainDto = {
      login: dto.login,
      email: dto.email,
      password: passwordHash,
    };

    try {
      const newUser = await this.usersRepo.create(domainDto);

      // * Вешаем ивент (сервис) для отправки письма. Нужно, что бы нашь кейс не зависил на прямую от стороннего сервиса (NodeMailerService).
      this.eventBus.publish(
        new UserRegisteredEvent(newUser.email, newUser.confirmationCode!),
      );
    } catch (error) {
      // * проверка на дубликат обьекта в бд: если обьект был удален, а мы хотим создать его с теме же полями (проблема soft delete + индекса).
      if (error instanceof Error && error.message.includes('duplicate key')) {
        const duplicatedField = error.message.includes('login')
          ? 'login'
          : 'email';

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
