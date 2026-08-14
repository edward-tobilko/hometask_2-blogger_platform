import { Injectable } from '@nestjs/common';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from './crypto.service';
import { UsersSqlRepository } from '../../infrastructure/sql/repositories/users-sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersSqlRepository,
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

    if (!user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'You should be authorized',
      });

    // if (user.banInfo?.isBanned) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.Unauthorized,
    //     message: user.banInfo.banExpiresAt
    //       ? `Your account is banned until ${user.banInfo.banExpiresAt.toISOString()}`
    //       : 'Your account is permanently banned',
    //   });
    // }

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
