import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  validateSync,
} from 'class-validator';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

function getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
  return Object.values(enumObj);
}

@Injectable()
export class CoreConfig {
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

  // * метод который обрабатывает все варианты
  private convertToBoolean(value: string) {
    const trimmedValue = value?.trim();

    if (trimmedValue === 'true') return true;
    if (trimmedValue === '1') return true;
    if (trimmedValue === 'enabled') return true;
    if (trimmedValue === 'false') return false;
    if (trimmedValue === '0') return false;
    if (trimmedValue === 'disabled') return false;

    return null;
  }

  @IsNumber({}, { message: 'Set Env variable PORT, example: 3000' })
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string = this.configService.get('MONGO_URI') ?? '';

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('NODE_ENV') ?? '';

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable / disable Swagger, example: true, available values: true, false',
  })
  isSwaggerEnabled = this.convertToBoolean(
    this.configService.get('IS_SWAGGER_ENABLED') ?? '',
  ) as boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable / disable. Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean = this.convertToBoolean(
    this.configService.get('INCLUDE_TESTING_MODULE') ?? '',
  ) as boolean;

  @IsBoolean({
    message:
      'Set Env variable SEND_INTERNAL_SERVER_ERROR_DETAILS to enable / disable. Dangerous for production internal server error details (message, etc), example: true, available values: true, false, 0, 1',
  })
  sendInternalServerErrorDetails: boolean = this.convertToBoolean(
    this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS') ?? '',
  ) as boolean;

  @IsNotEmpty({ message: 'Set env variable DB_NAME for your data base' })
  databaseName: string = this.configService.get('DB_NAME') ?? '';

  @IsNumber(
    {},
    {
      message:
        'Set Env variable TTL_RATE_LIMIT, example: 5000ms, 10000ms, 15000ms',
    },
  )
  ttlRateLimit: number = Number(this.configService.get('TTL_RATE_LIMIT'));

  @IsNumber(
    {},
    {
      message: 'Set Env variable COUNT_RATE_LIMIT, example: 5, 10, 15 counts',
    },
  )
  countRateLimit: number = Number(this.configService.get('COUNT_RATE_LIMIT'));

  @IsBoolean({
    message:
      'Set Env variable IS_DISABLE_RATE_LIMIT to enable / disable, example: true / false',
  })
  isRateLimitDisabled: boolean = this.convertToBoolean(
    this.configService.get('IS_DISABLE_RATE_LIMIT') ?? '',
  ) as boolean;

  @IsNotEmpty({
    message: 'Set Env variable ADMIN_USER_NAME, dangerous for security!',
  })
  adminUserName = this.configService.get('ADMIN_USER_NAME');

  @IsNotEmpty({
    message: 'Set Env variable ADMIN_PASSWORD, dangerous for security!',
  })
  adminPassword = this.configService.get('ADMIN_PASSWORD');
}

// ? CoreConfig - единая точка входа для всех переменных окружения с валидацией на старте и правильными типами. Что он решает:
// ? - одно место для всех env-переменных. Вместо process.env.PORT везде — мы инжектим CoreConfig и берем coreConfig.port.
// ? - валидация при старте (validateSync), если PORT не задан или NODE_ENV не входит в Environments, приложение не запустится с понятным сообщением об ошибке.
// ? - преобразование типов. process.env.PORT — строка "3000", а coreConfig.port — уже number. IS_SWAGGER_ENABLED — строка "true", а   coreConfig.isSwaggerEnabled — уже boolean.
