import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { configValidationUtility } from 'src/config/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  constructor(private configService: ConfigService) {
    configValidationUtility.validateConfig(this); // к моменту валидации все поля уже заполнены (все поля иннициализированные this.configService.get(''))
  }

  get isProduction(): boolean {
    return this.env === 'production';
  }

  @IsNumber({}, { message: 'Set env variable PORT, for example: 5001' })
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({
    message:
      'Set env variable MONGO_URI, for example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string = this.configService.get('MONGO_URI') ?? '';

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('NODE_ENV') ?? '';

  @IsBoolean({
    message:
      'Set env variable IS_SWAGGER_ENABLED to enable / disable Swagger, for example: true or false',
  })
  isSwaggerEnabled: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('IS_SWAGGER_ENABLED') ?? '',
  ) as boolean;

  @IsBoolean({
    message:
      'Set env variable INCLUDE_TESTING_MODULE to enable / disable. Dangerous for production TestingModule, for example: true / false / 0 / 1',
  })
  includeTestingModule: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('INCLUDE_TESTING_MODULE') ?? '',
  ) as boolean;

  @IsBoolean({
    message:
      'Set env variable SEND_INTERNAL_SERVER_ERROR_DETAILS to enable / disable. Dangerous for production internal server error details (message, etc), for example: true / false / 0 / 1',
  })
  sendInternalServerErrorDetails: boolean =
    configValidationUtility.convertToBoolean(
      this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS') ?? '',
    ) as boolean;

  @IsNotEmpty({ message: 'Set env variable DB_NAME for your data base' })
  databaseName: string = this.configService.get('DB_NAME') ?? '';

  @IsNumber(
    {},
    {
      message:
        'Set env variable TTL_RATE_LIMIT, for example: 5000ms, 10000ms, 15000ms',
    },
  )
  ttlRateLimit: number = Number(this.configService.get('TTL_RATE_LIMIT'));

  @IsNumber(
    {},
    {
      message:
        'Set env variable COUNT_RATE_LIMIT, for example: 5, 10, 15 counts',
    },
  )
  countRateLimit: number = Number(this.configService.get('COUNT_RATE_LIMIT'));

  @IsBoolean({
    message:
      'Set env variable IS_DISABLE_RATE_LIMIT to enable / disable, for example: true / false',
  })
  isRateLimitDisabled: boolean = configValidationUtility.convertToBoolean(
    this.configService.get('IS_DISABLE_RATE_LIMIT') ?? '',
  ) as boolean;

  @IsNotEmpty({
    message: 'Set env variable ADMIN_USER_NAME, dangerous for security!',
  })
  adminUserName = this.configService.get('ADMIN_USER_NAME');

  @IsNotEmpty({
    message: 'Set env variable ADMIN_PASSWORD, dangerous for security!',
  })
  adminPassword = this.configService.get('ADMIN_PASSWORD');
}
