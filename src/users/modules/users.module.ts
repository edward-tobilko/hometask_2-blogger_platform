import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from '../api/controllers/users.controller';
import { UsersService } from '../application/services/users.service';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { UsersQueryRepository } from '../infrastructure/repositories/users-query.repository';
import { UsersQueryService } from '../application/services/users.query-service';
import { User, UserSchema } from '../domain/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [UsersController],
  providers: [
    UsersService,
    UsersQueryService,
    UsersRepository,
    UsersQueryRepository,
  ],

  exports: [],
})
export class UsersModule {}
