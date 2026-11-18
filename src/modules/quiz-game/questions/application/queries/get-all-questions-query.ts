import { IQueryHandler, QueryHandler, Query } from '@nestjs/cqrs';

import { QuestionsQueryRepository } from '../../infrastructure/repositories/questions-query.repo';
import { QuestionsListPaginatedViewModel } from '../../api/view-dto/questions-paginated.view-dto';
import { QuestionsListQueryInputDto } from '../../api/input-dto/questions-list-query.input-dto';

export class GetAllQuestionsQuery extends Query<QuestionsListPaginatedViewModel> {
  constructor(public queryDto: QuestionsListQueryInputDto) {
    super();
  }
}

@QueryHandler(GetAllQuestionsQuery)
export class GetAllQuestionsHandler implements IQueryHandler<
  GetAllQuestionsQuery,
  QuestionsListPaginatedViewModel
> {
  constructor(private readonly queryRepo: QuestionsQueryRepository) {}

  execute({
    queryDto,
  }: GetAllQuestionsQuery): Promise<QuestionsListPaginatedViewModel> {
    return this.queryRepo.findAll(queryDto);
  }
}
