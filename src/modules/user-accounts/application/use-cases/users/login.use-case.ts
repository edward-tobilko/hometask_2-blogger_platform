import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class LoginCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  execute({ userId }: LoginCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    const accessToken = this.jwtService.sign({ userId });

    const RT_SECRET = this.configService.get('REFRESH_TOKEN_SECRET');
    const RT_TIME = this.configService.get('REFRESH_TOKEN_EXPIRE_IN') ?? '24h';
    const expiresAt = Number(
      this.configService.get('RT_COOKIE_MAX_AGE') ?? 86400000,
    ); // 24 часа в мс

    const refreshToken = this.jwtService.sign(
      { userId },
      {
        expiresIn: RT_TIME,
        secret: RT_SECRET,
      },
    );

    return Promise.resolve({ accessToken, refreshToken, expiresAt }); // ICommandHandler всегда требует Promise, так как метод синхронный а возвр. promise, нужно дожидаться.
  }
}
