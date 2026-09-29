import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserAccountsConfig } from '../../config/user-accounts.config';
import { UsersSqlRepository } from '../../infrastructure/sql/repositories/users-sql.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    userAccountConfig: UserAccountsConfig,

    private usersRepo: UsersSqlRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountConfig.accessTokenSecret,
    });
  }

  async validate(payload: { userId: string }): Promise<{ id: string }> {
    const user = await this.usersRepo.findByIdWithBanInfo(payload.userId);

    if (!user || user.userBanInfo?.isBanned === true) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'You are not authorized',
      });
    }

    return { id: payload.userId };
  }
}
