import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';
import { BlogSortFieldRP } from 'src/core/enums/enums';

export class BlogsQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(BlogSortFieldRP)
  sortBy: BlogSortFieldRP = BlogSortFieldRP.CreatedAt;

  @IsOptional()
  @IsString()
  searchNameTerm?: string;
}
