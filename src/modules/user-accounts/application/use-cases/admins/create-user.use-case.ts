import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CreateUserDomainDto } from 'src/modules/user-accounts/domain/dto/create-user.dto';
import { CryptoService } from '../../services/crypto.service';
import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';
import { getUniqueViolationField } from 'src/core/utils/get-unique-violation-field.util';

export class CreateUserCommand extends Command<{ id: string }> {
  constructor(public dto: CreateUserDomainDto) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  { id: string }
> {
  constructor(
    private usersRepo: UsersSqlRepository,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<{ id: string }> {
    const passwordHash = await this.cryptoService.generateHash(dto.password);

    // * Проверка для создания юзера с однаковым login or email, так как у нас индексация по login / email в БД, а обьекты целиком не удалены с БД, а только позначены как deletedAt.
    try {
      const isUserConfirmed = this.userAccountsConfig.isUserConfirmed;

      const { id } = await this.usersRepo.createByAdmin(
        {
          ...dto,
          password: passwordHash,
        },

        isUserConfirmed,
      );

      return { id };
    } catch (error: unknown) {
      // * Эта проверка нужно для теста: парсим поле из ошибки PostgreSQL (так как нам нужно сверять только login or email и возвращать их, а не loginOrEmail).
      const duplicatedField = getUniqueViolationField(error);

      if (duplicatedField) {
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
