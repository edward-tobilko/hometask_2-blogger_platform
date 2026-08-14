import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserBannedEvent } from 'src/modules/user-accounts/domain/events/user-banned.event';
import { UserUnBannedEvent } from 'src/modules/user-accounts/domain/events/user-unbanned.event';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/mongo/repositories/users.repository';
import { BanUserDomainDto } from './../../../domain/dto/ban-user.dto';

export class BanUserCommand {
  constructor(public readonly dto: BanUserDomainDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand, void> {
  constructor(
    private usersRepo: UsersRepository,
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
      user.ban(dto.banReason, dto.banExpiresAt);
    } else if (dto.isBanned === false) {
      user.unBan();
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
