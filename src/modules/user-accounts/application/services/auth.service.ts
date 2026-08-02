import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string } | null> {
    const user = await this.usersRepo.findUserByLoginOrEmail(
      loginOrEmail,
      loginOrEmail,
    );

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User is not found',
      });

    if (!user.emailConfirmation.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'You should be authorized',
      });

    if (user.isBanned) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: user.banExpiresAt
          ? `Your account is banned until ${user.banExpiresAt.toISOString()}`
          : 'Your account is permanently banned',
      });
    }

    const isValidPass = await this.cryptoService.compareHash(
      password,
      user.passwordHash,
    );

    if (!isValidPass)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Your password is not valid',
      });

    return { id: user.id.toString() };
  }
}
