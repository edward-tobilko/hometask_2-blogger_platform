import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from '../../infrastructure/repositories/questions.repo';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class DeleteQuestionCommand extends Command<void> {
  constructor(public id: string) {
    super();
  }
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<
  DeleteQuestionCommand,
  void
> {
  constructor(private questionsRepo: QuestionsRepository) {}

  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    const isDeleted = await this.questionsRepo.delete(id);

    if (!isDeleted) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This question with ID:${id} was not found`,
      });
    }
  }
}
