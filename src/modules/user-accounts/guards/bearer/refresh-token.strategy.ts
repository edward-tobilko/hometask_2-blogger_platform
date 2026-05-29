import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UserAccountsConfig } from '../../config/user-accounts.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(userAccountConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const token = req.cookies?.refreshToken as string | null;

          return token;
        },
      ]),
      secretOrKey: userAccountConfig.refreshTokenSecret,
    });
  }

  validate(payload: { userId: string }): { id: string } {
    return { id: payload.userId };
  }
}
