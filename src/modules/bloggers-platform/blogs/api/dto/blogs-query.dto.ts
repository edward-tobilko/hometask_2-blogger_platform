import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';

enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export class BlogsQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(BlogsSortBy)
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  searchNameTerm?: string;
}
