import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { UserExternalViewDto } from './external-dto/users.external-view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UserAccountOrmEntity } from '../sql/schemas/user-orm.entity';

export interface UserExternalRaw {
  u_id: string;
  u_login: string;
  u_email: string;
  u_created_at: Date;
}

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly userRepo: Repository<UserAccountOrmEntity>,
  ) {}

  async getByIdOrNotFoundFailQB(id: string): Promise<UserExternalViewDto> {
    const userQueryBuilder = this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .where('u.id = :id', { id })
      .andWhere('u.deletedAt IS NULL');

    const userRaw = await userQueryBuilder.getRawOne<UserExternalRaw>();

    if (!userRaw) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: `This user with ID:${id} was not authorized`,
      });
    }

    return UserExternalViewDto.mapRawToView(userRaw);
  }

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
