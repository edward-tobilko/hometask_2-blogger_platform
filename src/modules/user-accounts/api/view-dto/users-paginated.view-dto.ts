import { ApiProperty } from '@nestjs/swagger';

import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { UserViewDto } from './user.view-dto';

export class UsersPaginatedViewDto extends PaginatedViewDto<UserViewDto[]> {
  @ApiProperty({ type: [UserViewDto] })
  items!: UserViewDto[];

  static mapToView(data: {
    page: number;
    pageSize: number;
    totalCount: number;
    items: UserViewDto[];
  }): UsersPaginatedViewDto {
    return super.basicMapper(
      new UsersPaginatedViewDto(),
      data,
    ) as UsersPaginatedViewDto;
  }
}
