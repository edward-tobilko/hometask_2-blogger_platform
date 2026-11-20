import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from '../../infrastructure/repositories/questions.repo';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class PublishQuestionCommand extends Command<void> {
  constructor(
    public id: string,
    public dto: { published: boolean },
  ) {
    super();
  }
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<
  PublishQuestionCommand,
  void
> {
  constructor(private questionsRepo: QuestionsRepository) {}

  async execute({ id, dto }: PublishQuestionCommand): Promise<void> {
    const questionInstance = await this.questionsRepo.findById(id);

    if (!questionInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This question with ID:${id} was not found`,
      });
    }

    questionInstance.changePublishStatus(dto.published);

    await this.questionsRepo.save(questionInstance);
  }
}
