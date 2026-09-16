import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserAccountsConfig } from '../../config/user-accounts.config';
import { UsersSqlRepository } from '../../infrastructure/sql/repositories/users-sql.repository';

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

    return { id: payload.userId };
  }
}
