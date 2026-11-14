import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { QuestionsQueryRepository } from '../../infrastructure/repositories/questions-query.repo';
import { QuestionViewModel } from '../../api/view-dto/question.view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class GetQuestionByIdQuery {
  constructor(public readonly questionId: string) {}
}

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdHandler implements IQueryHandler<
  GetQuestionByIdQuery,
  QuestionViewModel
> {
  constructor(private queryRepo: QuestionsQueryRepository) {}

  async execute({
    questionId,
  }: GetQuestionByIdQuery): Promise<QuestionViewModel> {
    const mappedQuestion = await this.queryRepo.findById(questionId);

    if (!mappedQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Question with id: ${questionId} was not found!`,
      });
    }

    return mappedQuestion;
  }
}
