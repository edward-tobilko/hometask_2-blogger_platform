import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from 'src/modules/user-accounts/infrastructure/repositories/users.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(private usersRepo: UsersRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const existingUser = await this.usersRepo.findById(id);

    if (!existingUser)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The user with ID:${id} was not found`,
      });

    existingUser.makeDeleted();

    await this.usersRepo.save(existingUser);
  }
}
