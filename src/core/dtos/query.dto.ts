import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from 'src/core/constants/consts';
import { SortDirections } from 'src/core/enums/enums';

export class QueryDto {
  @IsOptional()
  @IsEnum(SortDirections)
  sortDirection: SortDirections = DEFAULT_SORT_DIRECTION;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => +value)
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100) // защита от DoS (Denial of Service) атак
  @Transform(({ value }) => +value)
  pageSize: number = DEFAULT_PAGE_SIZE;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

// ? При переходе на Nest теперь используем class а не type, так как в рантайме Nest не знает о полях, типах, дефолтах, а class — живёт в рантайме, и именно с ним работают ValidationPipe, Transform-декораторы.
