import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';

export class RefreshTokenCommand extends Command<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> {
  constructor(public userId: string) {
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
  ) {}

  execute({ userId }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    const accessToken = this.accessTokenContext.sign({ userId });
    const refreshToken = this.refreshTokenContext.sign({ userId });

    const expiresAt = Number(this.userAccountConfig.refreshTokenCookieMaxAge); // 24 часа в мс

    return Promise.resolve({ accessToken, refreshToken, expiresAt }); // ICommandHandler всегда требует Promise, так как метод синхронный а возвр. promise, нужно дожидаться.
  }
}
