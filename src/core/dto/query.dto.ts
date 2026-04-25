import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from 'src/core/constants/consts';
import { SortDirections } from 'src/core/enums/enums';

export abstract class QueryDto {
  abstract sortBy: string;

  @IsOptional()
  @IsEnum(SortDirections)
  @ApiProperty({
    default: 'desc',
  })
  sortDirection: SortDirections = DEFAULT_SORT_DIRECTION;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => +value)
  @ApiProperty({
    description: 'pageNumber is number of portions that should be returned',
    default: 1,
  })
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100) // защита от DoS (Denial of Service) атак
  @Transform(({ value }) => +value)
  @ApiProperty({
    description: 'pageSize is portions size that should be returned',
    default: 10,
  })
  pageSize: number = DEFAULT_PAGE_SIZE;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  calculateSort() {
    return { [this.sortBy]: this.sortDirection };
  }
}

// ? При переходе на Nest теперь используем class а не type, так как в рантайме Nest не знает о полях, типах, дефолтах, а class — живёт в рантайме, и именно с ним работают ValidationPipe, Transform-декораторы. class-transformer создает экземпляр класса QueryDto dto для полей.
