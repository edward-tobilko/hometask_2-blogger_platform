import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
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

const queryHandlers = [GetUsersListHandler, MeUseCase];

const commandHandlers = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  ConfirmationRegistrationUseCase,
  ResendConfirmationEmailUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  LoginUseCase,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule,
    PassportModule,

    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema }, // UserAccount.name = token по которому мы его инжектируем в наши сервисы / репо
    ]),
  ],

  controllers: [UsersController, AuthController],
  providers: [
    // * Configs
    UserAccountsConfig,

    // * Services
    ...commandHandlers,
    ...queryHandlers,
    UsersService,
    AuthService,
    CryptoService,
    NodeMailerService,

    // ? пример инстанцирования через токен, если надо внедрить несколько раз один и тот же класс
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
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

    // * Strategies
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,

    // * Externals
    UsersExternalQueryRepository,
  ],

  exports: [UsersExternalQueryRepository],
})
export class UserAccountsModule {}
