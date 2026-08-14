import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { UserAccountsConfig } from '../../config/user-accounts.config';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { SecurityDevicesSqlQueryRepository } from '../../infrastructure/sql/repositories/security-devices-query-sql.repository';

type ValidatePayload = {
  userId: string;
  deviceId: string;
  lastActiveDate: string;
};

type ValidatedPayloadResult = {
  id: string;
  deviceId: string;
  lastActiveDate: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    userAccountConfig: UserAccountsConfig,
    private readonly queryRepo: SecurityDevicesSqlQueryRepository,
  ) {
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

  async validate(payload: ValidatePayload): Promise<ValidatedPayloadResult> {
    const session = await this.queryRepo.findByDeviceId(payload.deviceId);

    if (
      !session ||
      session.lastActiveDate.toISOString() !==
        new Date(payload.lastActiveDate).toISOString()
    )
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message:
          'Token does not matches. You should be authorized in correct refresh token!',
      });

    return {
      id: payload.userId,
      deviceId: payload.deviceId,
      lastActiveDate: payload.lastActiveDate.toString(),
    };
  }
}
