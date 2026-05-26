import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, validateSync } from 'class-validator';

@Injectable()
export class UserAccountsConfig {
  constructor(private configService: ConfigService) {
    this.validateConfig(this); // к моменту валидации все поля уже заполнены (все поля иннициализированные this.configService.get(''))
  }

  private validateConfig(config: object) {
    const errors = validateSync(config);

    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');

      throw new Error('Validation failed: ' + sortedMessages);
    }
  }

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string =
    this.configService.get('ACCESS_TOKEN_SECRET') ?? '';

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string =
    this.configService.get('ACCESS_TOKEN_EXPIRE_IN') ?? '';

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string =
    this.configService.get('REFRESH_TOKEN_EXPIRE_IN') ?? '';

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_COOKIE_MAX_AGE, examples: 1h, 5m, 2d',
  })
  refreshTokenCookieMaxAge: string =
    this.configService.get('REFRESH_TOKEN_COOKIE_MAX_AGE') ?? '';

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string =
    this.configService.get('REFRESH_TOKEN_SECRET') ?? '';
}
