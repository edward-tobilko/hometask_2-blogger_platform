import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserAccountDocument } from 'src/modules/user-accounts/domain/entities/user.entity';
import { CreateUserInterface } from 'src/modules/user-accounts/domain/interfaces/create-user-interface';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import { CryptoService } from '../../services/crypto.service';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  UserAccountDocument
> {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<UserAccountDocument> {
    const passwordHash = await this.cryptoService.generateHash(dto.password);

    const domainDto: CreateUserInterface = {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };

    // * проверка для создания юзера с однаковым login or email, так как у нас индексация по login / email в БД, а обьекты целиком не удалены с БД, а только позначены как deletedAt.
    try {
      return await this.usersRepo.createByAdmin(domainDto);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        // * эта проверка нужно для теста: парсим поле из ошибки MongoDB (так как нам нужно сверять только login or email и возвращать их, а не loginOrEmail).
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
