import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';

import { UserAccountOrmEntity } from '../schemas/user-orm.entity';
import { UsersQueryInputDto } from '../../../api/input-dto/users-query.input-dto';
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { UserViewDto } from '../../../api/view-dto/user.view-dto';
import { UsersPaginatedViewDto } from '../../../api/view-dto/users-paginated.view-dto';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly usersRepo: Repository<UserAccountOrmEntity>,
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

    const [users, totalCount] = await this.usersRepo.findAndCount({
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
}
