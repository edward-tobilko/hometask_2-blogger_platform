import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { UserAccountOrmEntity } from '../sql/schemas/user-orm.entity';
import { UserTelegramContactExternalDto } from './external-dto/user-telegram-contact.external-dto';

@Injectable()
export class UsersExternalRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly userRepo: Repository<UserAccountOrmEntity>,
  ) {}

  // * Extra methods over the basic API logic

  // * Возвращает код для ссылки на бота или null, если пользователь не найден
  async issueTelegramConfirmationCode(userId: string): Promise<string | null> {
    const userInstance = await this.userRepo.findOne({
      where: {
        id: userId,

        deletedAt: IsNull(), // что бы не находить лишний раз удаленного пользователя
      },
    });

    if (!userInstance) return null;

    const code = randomUUID();

    userInstance.telegramConfirmationCode = code;

    await this.userRepo.save(userInstance);

    return code;
  }

  async linkTelegramChat(code: string, chatId: string): Promise<boolean> {
    const userInstance = await this.userRepo.findOne({
      where: {
        telegramConfirmationCode: code,

        deletedAt: IsNull(),
      },
    });

    if (!userInstance) return false;

    userInstance.telegramChatId = chatId;
    userInstance.telegramConfirmationCode = null;

    await this.userRepo.save(userInstance);

    return true;
  }

  async findTelegramContactsByIds(
    userIds: string[],
  ): Promise<UserTelegramContactExternalDto[]> {
    const users = await this.userRepo.find({
      where: {
        id: In(userIds),

        deletedAt: IsNull(),
      },
      select: { id: true, telegramChatId: true }, // читаем из БД только эти 2 свойства
    });

    console.log(users);

    return users;
  }
}
