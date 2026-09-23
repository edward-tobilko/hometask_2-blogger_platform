import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { UserExternalViewDto } from './external-dto/users.external-view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserAccountOrmEntity } from '../sql/schemas/user-orm.entity';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly userRepo: Repository<UserAccountOrmEntity>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalViewDto> {
    const userInstance = await this.userRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!userInstance) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: `This user with ID:${id} was not authorized`,
      });
    }

    return UserExternalViewDto.mapToView(userInstance);
  }
}

// ? External - то что мы хотим переиспользовать снаруже (за пределами UserAccountModule), что бы не шарить все данные с репо.
