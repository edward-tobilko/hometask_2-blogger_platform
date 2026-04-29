import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { CreateUserInputDto } from 'src/modules/user-accounts/api/input-dto/create-user.input-dto';
import { CreateUserInterface } from 'src/modules/user-accounts/domain/interfaces/create-user-interface';
import { UserAccountDocument } from 'src/modules/user-accounts/domain/entities/user.entity';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import {
  DomainException,
  DomainExceptionCode,
} from 'src/core/exceptions/domain.exceptions';

@Injectable()
export class UsersService {
  constructor(protected usersRepo: UsersRepository) {}

  async createUser(dto: CreateUserInputDto): Promise<UserAccountDocument> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const domainDto: CreateUserInterface = {
      login: dto.login,
      email: dto.email,
      passwordHash,

      name: {
        firstName: 'linda',
        lastName: 'melinda',
      },
    };

    // * проверка для создания юзера с однаковым login or email, так как у нас индексация по login / email в БД, а обьекты целиком не удалены с БД, а только позначены как deletedAt.
    try {
      return await this.usersRepo.create(domainDto);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'User with this login or email already exists',
        });
      }

      throw error;
    }
  }

  async softDeleteUser(id: string): Promise<void> {
    const existingUser = await this.usersRepo.findById(id);

    if (!existingUser)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The user with ID:${id} was not found`,
      });

    existingUser.makeDeleted();

    await this.usersRepo.save(existingUser);
  }
}
