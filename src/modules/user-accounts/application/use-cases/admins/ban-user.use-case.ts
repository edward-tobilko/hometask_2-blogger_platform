import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserBannedEvent } from 'src/modules/user-accounts/domain/events/user-banned.event';
import { UserUnBannedEvent } from 'src/modules/user-accounts/domain/events/user-unbanned.event';
import { BanUserDomainDto } from './../../../domain/dto/ban-user.dto';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';
import { calculateExpiresAt } from 'src/core/utils/calculate-expires-at.util';

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
    const user = await this.usersRepo.findById(dto.userId);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User is not found!`,
      });
    }

    // * Сначала persistence, потом side effects:
    // * мутации домена + сохранение в БД
    if (dto.isBanned === true) {
      user.isBanned = true; // бан
      user.banReason = dto.banReason; // причина
      user.bannedAt = new Date(); // когда забанен (дата в текущий момент)
      user.banExpiresAt = calculateExpiresAt(dto.banExpiresAt); // к какой дате и времени будет анбан
    } else if (dto.isBanned === false) {
      user.isBanned = false;
      user.banReason = null;
      user.bannedAt = null;
      user.banExpiresAt = null;
    }

    await this.usersRepo.updateBanStatus(user); // сохранили

    // * публикация событий
    if (dto.isBanned === true) {
      const event = new UserBannedEvent(user.id); // создаем событие

      this.eventBus.publish(event); // публикуем
    } else {
      this.eventBus.publish(new UserUnBannedEvent(user.id));
    }
  }
}
