import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersController } from './api/controllers/users.controller';
import { UsersService } from './application/services/users.service';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { UsersQueryRepository } from './infrastructure/repositories/users-query.repository';
import { UsersQueryService } from './application/services/users.query-service';
import { UserAccount, UserAccountSchema } from './domain/entities/user.entity';
import { AuthService } from './application/services/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthController } from './api/controllers/auth.controller';
import { CryptoService } from './application/services/crypto.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema }, // UserAccount.name = token по которому мы его инжектируем в наши сервисы / репо
    ]),

    PassportModule,
  ],

  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    LocalStrategy,
    CryptoService,
  ],

  exports: [],
})
export class UserAccountsModule {}
