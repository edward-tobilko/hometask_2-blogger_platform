import { IsEnum, IsOptional } from 'class-validator';

import { QueryDto } from 'src/core/dtos/query.dto';
import { PostSortFieldRP } from 'src/core/enums/enums';

export class PostsQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(PostSortFieldRP)
  sortBy: PostSortFieldRP = PostSortFieldRP.CreatedAt;
}
