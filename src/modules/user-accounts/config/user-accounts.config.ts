import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNotEmpty } from 'class-validator';

import { configValidationUtility } from 'src/config/config-validation.utility';

@Injectable()
export class UserAccountsConfig {
  constructor(private configService: ConfigService) {
    configValidationUtility.validateConfig(this); // к моменту валидации все поля уже заполнены (все поля иннициализированные this.configService.get(''))
  }

  @IsNotEmpty({
    message: 'Set env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string =
    this.configService.get('ACCESS_TOKEN_SECRET') ?? '';

  @IsNotEmpty({
    message:
      'Set env variable ACCESS_TOKEN_EXPIRE_IN, for examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string =
    this.configService.get('ACCESS_TOKEN_EXPIRE_IN') ?? '';

  @IsNotEmpty({
    message:
      'Set env variable REFRESH_TOKEN_EXPIRE_IN, for examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string =
    this.configService.get('REFRESH_TOKEN_EXPIRE_IN') ?? '';

  @IsNotEmpty({
    message:
      'Set env variable REFRESH_TOKEN_COOKIE_MAX_AGE, for examples: 1h, 5m, 2d',
  })
  refreshTokenCookieMaxAge: string =
    this.configService.get('REFRESH_TOKEN_COOKIE_MAX_AGE') ?? '';

  @IsNotEmpty({
    message: 'Set env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string =
    this.configService.get('REFRESH_TOKEN_SECRET') ?? '';

  @IsBoolean({
    message:
      'Set env variable IS_USER_AUTOMATICALLY_CONFIRMED, for examples: false. Dangerous setting!',
  })
  isUserConfirmed: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('IS_USER_AUTOMATICALLY_CONFIRMED') ?? '',
  ) as boolean;
}
