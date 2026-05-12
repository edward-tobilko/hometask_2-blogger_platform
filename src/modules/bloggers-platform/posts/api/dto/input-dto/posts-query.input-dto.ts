import { IsEnum, IsOptional } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';

export enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogName = 'blogName',
}

export class PostsQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(PostsSortBy)
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
}
