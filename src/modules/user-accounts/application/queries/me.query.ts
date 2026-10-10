import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserSessionViewDto } from '../../api/view-dto/user-session.view-dto';
import { UsersSqlQueryRepository } from '../../infrastructure/sql/repositories/users-sql-query.repository';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class MeQuery {
  constructor(public userId: string) {}
}

@QueryHandler(MeQuery)
export class MeQueryHandler implements IQueryHandler<
  MeQuery,
  UserSessionViewDto
> {
  constructor(private userQueryRepo: UsersSqlQueryRepository) {}

  async execute({ userId }: MeQuery): Promise<UserSessionViewDto> {
    const mappedUser = await this.userQueryRepo.findMeById(userId);

    // ! Проверку на юзера можно не делать, так как в контроллере -> JwtAuthGuard гард ее делает, но между гардом и query его могли удалить. Вывод: лучше делать проверку и там и там!

    if (!mappedUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'You are not authorized',
      });
    }

    return mappedUser;
  }
}
