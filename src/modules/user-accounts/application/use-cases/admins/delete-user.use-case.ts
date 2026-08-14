import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UsersSqlRepository } from 'src/modules/user-accounts/infrastructure/sql/repositories/users-sql.repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(private usersRepo: UsersSqlRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const existingUser = await this.usersRepo.findById(id);

    if (!existingUser)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `The user with ID:${id} was not found`,
      });

    existingUser.deletedAt = new Date(); // прямое присвоение даты удаления (так как у нас нету domain methods)

    await this.usersRepo.save(existingUser);
  }
}
