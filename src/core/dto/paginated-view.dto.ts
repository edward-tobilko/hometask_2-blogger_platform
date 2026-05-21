import { ApiProperty } from '@nestjs/swagger';

export abstract class PaginatedViewDto<T> {
  @ApiProperty()
  pagesCount!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  totalCount!: number;

  abstract items: T;

  protected static basicMapper<T>(
    target: PaginatedViewDto<T>,
    data: {
      page: number;
      pageSize: number;
      totalCount: number;
      items: T;
    },
  ): PaginatedViewDto<T> {
    target.pagesCount = Math.ceil(data.totalCount / data.pageSize);
    target.page = data.page;
    target.pageSize = data.pageSize;
    target.totalCount = data.totalCount;

    target.items = data.items;

    return target;
  }
}
