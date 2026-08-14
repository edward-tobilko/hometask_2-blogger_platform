import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CreateUserDomainDto } from 'src/modules/user-accounts/domain/dto/create-user.dto';
import { CryptoService } from '../../services/crypto.service';
import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import { UserViewDto } from 'src/modules/user-accounts/api/view-dto/user.view-dto';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';

export class CreateUserCommand extends Command<UserViewDto> {
  constructor(public dto: CreateUserDomainDto) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  UserViewDto
> {
  constructor(
    private usersRepo: UsersSqlRepository,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<UserViewDto> {
    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const domainDto: CreateUserDomainDto = {
      login: dto.login,
      email: dto.email,
      password: passwordHash,
    };

    // * проверка для создания юзера с однаковым login or email, так как у нас индексация по login / email в БД, а обьекты целиком не удалены с БД, а только позначены как deletedAt.
    try {
      const isUserConfirmed = this.userAccountsConfig.isUserConfirmed;

      const userInstanceDoc = await this.usersRepo.createByAdmin(
        domainDto,
        isUserConfirmed,
      );

      return {
        id: userInstanceDoc.id,
        login: userInstanceDoc.login,
        email: userInstanceDoc.email,
        createdAt: userInstanceDoc.createdAt,
      };
    } catch (error: unknown) {
      // * Эта проверка нужно для теста: парсим поле из ошибки PostgreSQL (так как нам нужно сверять только login or email и возвращать их, а не loginOrEmail).
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
              duplicatedField, // just for status code 400 (bad request)
            ),
          ],
        });
      }

      throw error;
    }
  }
}
