import { ApiProperty } from '@nestjs/swagger';

import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { CommentViewModel } from './comment.view-dto';

export class CommentsPaginatedViewModel extends PaginatedViewDto<
  CommentViewModel[]
> {
  @ApiProperty({ type: [CommentViewModel] })
  items!: CommentViewModel[];

  static mapToView(data: {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: CommentViewModel[];
  }): CommentsPaginatedViewModel {
    return super.basicMapper(new CommentsPaginatedViewModel(), data);
  }
}
