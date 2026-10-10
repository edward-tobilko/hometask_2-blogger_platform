import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';

import { UserAccountOrmEntity } from '../schemas/user-orm.entity';
import { UsersQueryInputDto } from '../../../api/input-dto/users-query.input-dto';
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { UserViewDto } from '../../../api/view-dto/user.view-dto';
import { UsersPaginatedViewDto } from '../../../api/view-dto/users-paginated.view-dto';
import { UserSessionViewDto } from 'src/modules/user-accounts/api/view-dto/user-session.view-dto';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly userQueryRepo: Repository<UserAccountOrmEntity>,
  ) {}

  async findUsersList(
    query: UsersQueryInputDto,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const { pageNumber, pageSize, searchEmailTerm, searchLoginTerm } = query;

    const loginTerm = searchLoginTerm?.trim();
    const emailTerm = searchEmailTerm?.trim();

    const where: FindOptionsWhere<UserAccountOrmEntity>[] = [];
    const base = { deletedAt: IsNull() };

    if (loginTerm) where.push({ ...base, login: ILike(`%${loginTerm}%`) });
    if (emailTerm) where.push({ ...base, email: ILike(`%${emailTerm}%`) });
    if (!loginTerm && !emailTerm) where.push(base);

    const [users, totalCount] = await this.userQueryRepo.findAndCount({
      where,
      order: query.calculateSort(),
      skip: query.calculateSkip(),
      take: pageSize,
    });

    return UsersPaginatedViewDto.mapToView({
      page: pageNumber,
      pageSize,
      totalCount,

      items: users.map(UserViewDto.mapToViewModel),
    });
  }

  async findById(id: string): Promise<UserViewDto | null> {
    const userInstance = await this.userQueryRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!userInstance) return null;

    return UserViewDto.mapToViewModel(userInstance);
  }

  async findMeById(id: string): Promise<UserSessionViewDto | null> {
    const userInstance = await this.userQueryRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!userInstance) return null;

    return UserSessionViewDto.mapToViewModel(userInstance);
  }
}
