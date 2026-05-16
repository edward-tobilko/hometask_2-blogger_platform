import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import { CryptoService } from '../../services/crypto.service';

export class NewPasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<
  NewPasswordCommand,
  void
> {
  constructor(
    private usersRepo: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: NewPasswordCommand): Promise<void> {
    const user = await this.usersRepo.findByRecoveryCode(recoveryCode);

    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect',
        extensions: [
          new Extension('Recovery code is incorrect', 'recoveryCode'),
        ],
      });

    const passwordHash = await this.cryptoService.generateHash(newPassword);

    user.setNewPassword(passwordHash);

    await this.usersRepo.save(user);
  }
}
