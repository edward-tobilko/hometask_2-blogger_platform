import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { SortDirections } from 'src/core/enums/sort-directions.enum.ts';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIRECTION,
} from '../constants/pagination.constants';
import { Query } from '../decorators/query.decorator';

export abstract class QueryDto {
  abstract sortBy: string;

  @ApiProperty({
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(SortDirections)
  sortDirection: SortDirections = DEFAULT_SORT_DIRECTION;

  @ApiProperty({
    description: 'pageNumber is number of portions that should be returned',
    default: 1,
  }) // for swagger doc
  @Query(1, 100) // custom decorator
  pageNumber: number = DEFAULT_PAGE_NUMBER;

  @ApiProperty({
    description: 'pageSize is portions size that should be returned',
    default: 10,
  })
  @Query(1, 100)
  pageSize: number = DEFAULT_PAGE_SIZE;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  calculateSort() {
    return { [this.sortBy]: this.sortDirection };
  }
}

// ? При переходе на Nest теперь используем class а не type, так как в рантайме Nest не знает о полях, типах, дефолтах, а class — живёт в рантайме, и именно с ним работают ValidationPipe, Transform-декораторы. class-transformer создает экземпляр класса QueryDto dto  полей .
