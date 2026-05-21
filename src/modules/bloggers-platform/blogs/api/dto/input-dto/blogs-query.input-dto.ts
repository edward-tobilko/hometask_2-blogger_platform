import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export class BlogsQueryDto extends QueryDto {
  @IsEnum(BlogsSortBy)
  @IsOptional()
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;

  @ApiProperty({
    description:
      'Search term for blog Name: Name should contains this term in any position',
  })
  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
