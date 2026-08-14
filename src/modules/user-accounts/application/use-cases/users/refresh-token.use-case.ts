import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { SecurityDevicesSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/security-devices-sql.repository';

export class RefreshTokenCommand extends Command<{
  accessToken: string;
  refreshToken: string;
  cookieMaxAge: number;
}> {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {
    super();
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN) // по этому токену мы в UserAccountsModule определяем нужные нам поля с .env
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private userAccountConfig: UserAccountsConfig,
    private securityDevicesRepo: SecurityDevicesSqlRepository,
  ) {}

  async execute({ userId, deviceId }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    cookieMaxAge: number;
  }> {
    const accessToken = this.accessTokenContext.sign({ userId });

    const lastActiveDate = new Date();

    await this.securityDevicesRepo.updateLastActiveDate(
      deviceId,
      lastActiveDate,
    );

    // * Все то, что мы запишем в cookie
    const refreshToken = this.refreshTokenContext.sign({
      userId,
      deviceId,
      lastActiveDate,
    });

    const cookieMaxAge = Number(
      this.userAccountConfig.refreshTokenCookieMaxAge,
    );

    return Promise.resolve({ accessToken, refreshToken, cookieMaxAge }); // ICommandHandler всегда требует Promise, так как метод синхронный а возвр. promise, нужно дожидаться.
  }
}
