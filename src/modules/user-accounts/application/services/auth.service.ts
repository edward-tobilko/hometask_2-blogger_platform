import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from './crypto.service';
import { UsersSqlRepository } from '../../infrastructure/sql/repositories/users-sql.repository';
import { UserUnBannedEvent } from '../../domain/events/user-unbanned.event';

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersSqlRepository,
    private cryptoService: CryptoService,

    private eventBus: EventBus,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string } | null> {
    const user = await this.usersRepo.findUserByLoginOrEmail(
      loginOrEmail,
      loginOrEmail,
    );

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User is not found',
      });

    if (!user.isConfirmed)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'You should be authorized',
      });

    // * Бан истёк — снимаем, сохраняем, сообщаем остальным модулям.
    if (user.userBanInfo?.liftIfBanExpired()) {
      await this.usersRepo.save(user);

      await this.eventBus.publish(new UserUnBannedEvent(user.id));
    }

    // * Бан действует — не пускаем
    if (user.userBanInfo?.isBanActive()) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: user.userBanInfo?.banExpiresAt
          ? `Your account is banned until ${user.userBanInfo?.banExpiresAt.toISOString()}`
          : 'Your account is permanently banned',
      });
    }

    const isValidPass = await this.cryptoService.compareHash(
      password,
      user.passwordHash,
    );

    if (!isValidPass)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Your password is not valid',
      });

    return { id: user.id.toString() };
  }
}
