import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserAccountsConfig } from '../../config/user-accounts.config';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    userAccountConfig: UserAccountsConfig,
    private usersRepo: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountConfig.accessTokenSecret,
    });
  }

  async validate(payload: { userId: string }): Promise<{ id: string }> {
    const user = await this.usersRepo.findById(payload.userId);

    // * Проверка юзера на ban / unban
    if (user?.banInfo?.isBanned) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: `Your account is permanently banned`,
      });
    }

    return { id: payload.userId };
  }
}
