import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersSqlQueryRepository } from '../../infrastructure/sql/repositories/users-sql-query.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class GetUserByIdQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserViewDto
> {
  constructor(private userQueryRepo: UsersSqlQueryRepository) {}

  async execute({ id }: GetUserByIdQuery): Promise<UserViewDto> {
    const mappedUser = await this.userQueryRepo.findById(id);

    if (!mappedUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `User with id: ${id} was not found`,
      });
    }

    return mappedUser;
  }
}
