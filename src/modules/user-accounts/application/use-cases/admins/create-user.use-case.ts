import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserAccountDocument } from 'src/modules/user-accounts/domain/entities/user.entity';
import { CreateUserDomainDto } from 'src/modules/user-accounts/domain/dto/create-user.dto';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import { CryptoService } from '../../services/crypto.service';
import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';

// * CreateUserCommand - просто хранение данных в команде. Никакой логики, только данные. Просто контейнер для переноса данных от контроллера к use case.
export class CreateUserCommand {
  constructor(public dto: CreateUserDomainDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  UserAccountDocument
> {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<UserAccountDocument> {
    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const domainDto: CreateUserDomainDto = {
      login: dto.login,
      email: dto.email,
      password: passwordHash,
    };

    // * проверка для создания юзера с однаковым login or email, так как у нас индексация по login / email в БД, а обьекты целиком не удалены с БД, а только позначены как deletedAt.
    try {
      const isUserConfirmed = this.userAccountsConfig.isUserConfirmed;

      return await this.usersRepo.createByAdmin(domainDto, isUserConfirmed);
    } catch (error: unknown) {
      // * эта проверка нужно для теста: парсим поле из ошибки MongoDB (так как нам нужно сверять только login or email и возвращать их, а не loginOrEmail).
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
              duplicatedField, // just for status code 400 (bad request)
            ),
          ],
        });
      }

      throw error;
    }
  }
}

// ? @CommandHandler(CreateUserCommand) - связка.

// ? CreateUserUseCase - обработчик именно CreateUserCommand.

// ? CommandBus в контроллере внутри себя ведёт реестр: команда → обработчик. Когда прилетает CreateUserCommand, шина находит CreateUserUseCase и вызывает его execute().

// ? ICommandHandler<Command, Result> — контракт: первый generic Command — тип команды, которую принимает execute, а второй generic Result — тип того, что execute вернёт.
