import { ApiProperty } from '@nestjs/swagger';

import { PostViewModel } from './post.view-dto';
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';

export class PostsPaginatedViewModel extends PaginatedViewDto<PostViewModel[]> {
  @ApiProperty({ type: [PostViewModel] })
  items!: PostViewModel[];

  static mapToView(data: {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: PostViewModel[];
  }): PostsPaginatedViewModel {
    return super.basicMapper(
      new PostsPaginatedViewModel(),
      data,
    ) as PostsPaginatedViewModel;
  }
}
