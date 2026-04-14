import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from 'src/core/constants/api-routes';

export enum SortDirections {
  ASC = 'asc', // ascending = (1)
  DESC = 'desc', // descending = (-1)
}

export enum BlogSortFieldRP {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export class BlogsQueryDto {
  @IsOptional()
  @IsString()
  searchNameTerm?: string;

  @IsOptional()
  @IsEnum(BlogSortFieldRP)
  sortBy: BlogSortFieldRP = BlogSortFieldRP.CreatedAt;

  @IsOptional()
  @IsEnum(SortDirections)
  sortDirection: SortDirections = DEFAULT_SORT_DIRECTION;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => +value)
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Transform(({ value }) => +value)
  pageSize: number = DEFAULT_PAGE_SIZE;
}

// ? При переходе на Nest теперь используем class а не type, так как в рантайме Nest не знает о полях, типах, дефолтах, а class — живёт в рантайме, и именно с ним работают ValidationPipe, Transform-декораторы.
