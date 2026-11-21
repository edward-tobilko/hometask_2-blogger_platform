import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';
import { PublishedStatus } from 'src/core/enums/published-status.enum';

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
  body = 'body',
}

export class QuestionsListQueryInputDto extends QueryDto {
  @IsEnum(QuestionsSortBy)
  sortBy: QuestionsSortBy = QuestionsSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;

  @IsEnum(PublishedStatus)
  @IsOptional()
  publishedStatus: PublishedStatus = PublishedStatus.ALL;
}
