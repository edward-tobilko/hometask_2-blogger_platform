import { IsEnum, IsOptional, IsString } from 'class-validator';

import { QueryDto } from 'src/core/dto/query.dto';
import { QuestionsPublishedStatus } from 'src/core/enums/quiz-questions-published-status.enum';

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

  @IsEnum(QuestionsPublishedStatus)
  @IsOptional()
  publishedStatus: QuestionsPublishedStatus = QuestionsPublishedStatus.ALL;
}
