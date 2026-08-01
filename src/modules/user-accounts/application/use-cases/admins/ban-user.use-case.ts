import { BanUserDto } from './../../../domain/dto/ban-user.dto';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserBannedEvent } from 'src/modules/user-accounts/domain/events/user-banned.event';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';

export class BanUserCommand {
  constructor(public readonly dto: BanUserDto) {}
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

    user.ban(dto.banReason, dto.banExpiresAt);

    await this.usersRepo.save(user);

    // * создаем событие
    const event = new UserBannedEvent(user.id);

    // * публикуем
    this.eventBus.publish(event);
  }
}
