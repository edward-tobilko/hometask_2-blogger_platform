import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { CryptoService } from '../../services/crypto.service';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';

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
    private usersRepo: UsersSqlRepository,
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

    if (
      !user.recoveryCode ||
      !user.recoveryCodeExpiry ||
      user.recoveryCodeExpiry < new Date()
    )
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is expired or incorrect',
        extensions: [
          new Extension(
            'Recovery code is expired or incorrect',
            'recoveryCode',
          ),
        ],
      });

    user.passwordHash = passwordHash;
    user.recoveryCode = null;
    user.recoveryCodeExpiry = null;

    await this.usersRepo.save(user);
  }
}
