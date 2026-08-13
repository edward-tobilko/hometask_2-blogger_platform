import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserAccountsConfig } from '../../config/user-accounts.config';
// import { DomainException } from 'src/core/exceptions/domain.exception';
// import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersSqlRepository } from '../../infrastructure/repositories/users-sql.repository';

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
    await this.usersRepo.findById(payload.userId);

    // // * Проверка юзера на ban / unban
    // if (user?.banInfo?.isBanned) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.Unauthorized,
    //     message: `Your account is permanently banned`,
    //   });
    // }

    return { id: payload.userId };
  }
}
