import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { SecurityDevicesSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/security-devices-sql.repository';

export class LoginCommand extends Command<{
  accessToken: string;
  refreshToken: string;
  cookieMaxAge: number;
}> {
  constructor(
    public userId: string,
    public ip: string,
    public userAgent: string,
  ) {
    super();
  }
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN) // по этому токену мы в UserAccountsModule определяем нужные нам поля с .env
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private userAccountConfig: UserAccountsConfig,
    private securityDevicesRepo: SecurityDevicesSqlRepository,
  ) {}

  async execute({ userId, ip, userAgent }: LoginCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    cookieMaxAge: number;
  }> {
    const accessToken = this.accessTokenContext.sign({ userId });

    const deviceId = randomUUID(); // генерируем уникальный id для девайса
    const lastActiveDate = new Date(); // текущая дата

    const refreshToken = this.refreshTokenContext.sign({
      userId,
      deviceId,
      lastActiveDate, // кладём в токен (теперь его можно прочитать декодировав в cookie)
    });

    const decoded: {
      exp: number;
    } = this.refreshTokenContext.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000); // переводим секунды в миллисекунды

    const cookieMaxAge = Number(
      this.userAccountConfig.refreshTokenCookieMaxAge,
    );

    await this.securityDevicesRepo.create({
      ip,
      title: userAgent ?? 'Unknown', // fallback когда HTTP-заголовок отсутствует: в тестах, у curl, у клиентов без user-agent
      lastActiveDate, // сохраняем в БД
      deviceId,
      userId, // репозиторий должен знать какому пользователю принадлежит сессия
      expiresAt,
    });

    return Promise.resolve({ accessToken, refreshToken, cookieMaxAge }); // ICommandHandler всегда требует Promise, так как метод синхронный а возвр. promise, нужно дожидаться.
  }
}
