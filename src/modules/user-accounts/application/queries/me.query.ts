import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserSessionViewDto } from '../../api/view-dto/user-session.view-dto';
import { UsersSqlRepository } from '../../infrastructure/repositories/users-sql.repository';

export class MeQuery {
  constructor(public userId: string) {}
}

@QueryHandler(MeQuery)
export class MeUseCase implements IQueryHandler<MeQuery, UserSessionViewDto> {
  constructor(private usersRepo: UsersSqlRepository) {}

  async execute({ userId }: MeQuery): Promise<UserSessionViewDto> {
    const user = await this.usersRepo.findById(userId);

    // ! проверку можно не делать, так как в контроллере -> JwtAuthGuard гард ее делает

    const userSessionView: UserSessionViewDto = {
      email: user!.email,
      login: user!.login,
      userId: user!.id,
    };

    return userSessionView;
  }
}
