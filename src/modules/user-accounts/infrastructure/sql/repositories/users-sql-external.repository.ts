import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { UserAccountOrmEntity } from '../schemas/user-orm.entity';

@Injectable()
export class UsersSqlExternalRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly userRepo: Repository<UserAccountOrmEntity>,
  ) {}

  async findById(userId: string): Promise<UserAccountOrmEntity | null> {
    return this.userRepo.findOne({
      where: {
        id: userId,

        deletedAt: IsNull(), // что бы не находить лишний раз удаленного пользователя
      },
    });
  }

  async save(userInstance: UserAccountOrmEntity): Promise<void> {
    await this.userRepo.save(userInstance);
  }

  // * Extra methods over the basic API logic
  async findByTelegramConfirmationCode(
    code: string,
  ): Promise<UserAccountOrmEntity | null> {
    return this.userRepo.findOne({
      where: {
        confirmationCode: code,
      },
    });
  }

  async findByIds(userIds: string[]): Promise<UserAccountOrmEntity[]> {
    return this.userRepo.find({
      where: {
        id: In(userIds),

        deletedAt: IsNull(),
      },
    });
  }
}
