import { ApiProperty } from '@nestjs/swagger';

import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { BlogViewModel } from './blog.view-dto';

export class BlogListPaginatedViewModel extends PaginatedViewDto<
  BlogViewModel[]
> {
  @ApiProperty({ type: [BlogViewModel] })
  items!: BlogViewModel[];

  static mapToView(data: {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: BlogViewModel[];
  }): BlogListPaginatedViewModel {
    return super.basicMapper(
      new BlogListPaginatedViewModel(),
      data,
    ) as BlogListPaginatedViewModel;
  }
}
