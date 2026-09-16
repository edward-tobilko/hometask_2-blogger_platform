import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserBannedEvent } from 'src/modules/user-accounts/domain/events/user-banned.event';
import { UserUnBannedEvent } from 'src/modules/user-accounts/domain/events/user-unbanned.event';
import { BanUserDomainDto } from './../../../domain/dto/ban-user.dto';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';
import { calculateExpiresAt } from 'src/core/utils/calculate-expires-at.util';
import { ExtraUserBanInfoOrmEntity } from 'src/modules/user-accounts/infrastructure/sql/schemas/extra-user-ban-info-orm.entity';

export class BanUserCommand {
  constructor(public readonly dto: BanUserDomainDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand, void> {
  constructor(
    private usersRepo: UsersSqlRepository,
    private eventBus: EventBus,
  ) {}

  async execute({ dto }: BanUserCommand): Promise<void> {
    const user = await this.usersRepo.findByIdWithBanInfo(dto.userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User is not found!`,
      });
    }

    if (!user.userBanInfo) {
      user.userBanInfo = new ExtraUserBanInfoOrmEntity();
    }

    // * Сначала persistence, потом side effects: мутации домена + сохранение в БД
    if (dto.isBanned === true) {
      user.userBanInfo.isBanned = true; // бан
      user.userBanInfo.banReason = dto.banReason; // причина
      user.userBanInfo.bannedAt = new Date(); // когда забанен (дата в текущий момент)
      user.userBanInfo.banExpiresAt = calculateExpiresAt(dto.banExpiresAt); // к какой дате и времени будет анбан
    } else if (dto.isBanned === false) {
      user.userBanInfo.isBanned = false;
      user.userBanInfo.banReason = null;
      user.userBanInfo.bannedAt = null;
      user.userBanInfo.banExpiresAt = null;
    }

    await this.usersRepo.save(user); // сохранили

    // * Публикация событий
    if (dto.isBanned === true) {
      const event = new UserBannedEvent(user.id); // создаем событие

      this.eventBus.publish(event); // публикуем
    } else {
      this.eventBus.publish(new UserUnBannedEvent(user.id));
    }
  }
}
