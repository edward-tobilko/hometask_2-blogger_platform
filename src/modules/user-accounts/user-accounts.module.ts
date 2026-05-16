import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

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

    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema }, // UserAccount.name = token по которому мы его инжектируем в наши сервисы / репо
    ]),

    JwtModule.registerAsync({
      inject: [ConfigService],

      // сетаем конфигы для access token
      useFactory: (config: ConfigService) => ({
        secret: config.get('AT_SECRET'),
        signOptions: {
          expiresIn: config.get('AT_TIME') ?? '5m',
        },
      }),
    }),

    PassportModule,
  ],

  controllers: [UsersController, AuthController],
  providers: [
    // * services
    ...commandHandlers,
    ...queryHandlers,
    UsersService,
    AuthService,
    CryptoService,
    NodeMailerService,

    // * repositories
    UsersRepository,
    UsersQueryRepository,

    // * strategies
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
  ],

  exports: [],
})
export class UserAccountsModule {}
