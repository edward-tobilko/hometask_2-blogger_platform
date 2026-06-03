import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { UsersController } from './api/controllers/users.controller';
import { UsersService } from './application/services/users.service';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { UsersQueryRepository } from './infrastructure/repositories/users-query.repository';
import { UserAccount, UserAccountSchema } from './domain/entities/user.entity';
import { AuthService } from './application/services/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthController } from './api/controllers/auth.controller';
import { CryptoService } from './application/services/crypto.service';
import { NodeMailerService } from './infrastructure/external-services/mailer.external-service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { CreateUserUseCase } from './application/use-cases/admins/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/admins/delete-user.use-case';
import { GetUsersListHandler } from './application/queries/get-users-list.query';
import { RegisterUserUseCase } from './application/use-cases/users/register-user.use-case';
import { ConfirmationRegistrationUseCase } from './application/use-cases/users/confirm-register.use-case';
import { ResendConfirmationEmailUseCase } from './application/use-cases/users/resend-email-register.use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/users/password-recovery.use-case';
import { NewPasswordUseCase } from './application/use-cases/users/new-password.use-case';
import { LoginUseCase } from './application/use-cases/users/login.use-case';
import { MeUseCase } from './application/queries/me.query';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repo';
import { UserAccountsConfig } from './config/user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { UserRegisteredEventHandler } from './application/event-handlers/user-registered.event-handler';
import { RefreshTokenUseCase } from './application/use-cases/users/refresh-token.use-case';
import { RefreshTokenStrategy } from './guards/bearer/refresh-token.strategy';
import { SecurityDevicesRepository } from './infrastructure/repositories/security-devices.repository';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './domain/entities/security-devices.entity';
import { SecurityDevicesController } from './api/controllers/security-devices.controller';
import { SecurityDevicesQueryRepository } from './infrastructure/repositories/security-devices-query.repository';
import { SecurityDevicesHandler } from './application/queries/get-security-devices.query';
import { DeleteSecurityDeviceByIdUseCase } from './application/use-cases/security-devices/delete-security-device-by-id.use-case';
import { DeleteAllSecurityDevicesExceptCurrentUseCase } from './application/use-cases/security-devices/delete-all-security-devices.use-case';
import { LogoutUseCase } from './application/use-cases/users/logout.use-case';

const handlers = {
  queryHandlers: [GetUsersListHandler, MeUseCase, SecurityDevicesHandler],

  commandHandlers: [
    // * Users
    CreateUserUseCase,
    DeleteUserUseCase,
    RegisterUserUseCase,

    // * Auth
    ConfirmationRegistrationUseCase,
    ResendConfirmationEmailUseCase,
    PasswordRecoveryUseCase,
    NewPasswordUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,

    // * Security Devices
    DeleteSecurityDeviceByIdUseCase,
    DeleteAllSecurityDevicesExceptCurrentUseCase,
  ],

  eventHandlers: [UserRegisteredEventHandler],
};

const strategies = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  RefreshTokenStrategy,
];

@Module({
  imports: [
    JwtModule,
    PassportModule,

    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema }, // UserAccount.name = token по которому мы его инжектируем в наши сервисы / репо
      { name: SecurityDevices.name, schema: SecurityDevicesSchema },
    ]),
  ],

  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    // * Configs
    UserAccountsConfig,

    // * Services
    ...handlers.commandHandlers,
    ...handlers.eventHandlers,
    ...handlers.queryHandlers,
    UsersService,
    AuthService,
    CryptoService,
    NodeMailerService,

    // ? пример инстанцирования через токен, если надо внедрить несколько раз один и тот же класс. Тот же вариант обьявления что и выше, только настройки в ручную.
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          // * Замыкание: JwtService создаётся один раз, но внутри него замкнуты значения secret и expiresIn из userAccountConfig. Конфиг может быть давно выгружен из стека, но JwtService продолжает использовать эти значения.
          secret: userAccountConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.accessTokenExpireIn as StringValue,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountConfig.refreshTokenExpireIn as StringValue,
          },
        });
      },
      inject: [UserAccountsConfig],
    },

    // * Repositories
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesRepository,
    SecurityDevicesQueryRepository,

    ...strategies,

    // * Externals
    UsersExternalQueryRepository,
  ],

  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule {}

// ? При инжектировании провайдера (если, кому то понадобиться какой либо провайдер заинжектировать), nest под капотом вызывает класс с пом. оператора new, тем самым создавая екземпляр данного класса (провайдера).
