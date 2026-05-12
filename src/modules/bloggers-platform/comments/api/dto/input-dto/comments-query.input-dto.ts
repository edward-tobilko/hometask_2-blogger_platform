import { IsEnum, IsOptional } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';

export enum CommentsSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}

export class CommentsQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(CommentsSortBy)
  sortBy: CommentsSortBy = CommentsSortBy.CreatedAt;
}
