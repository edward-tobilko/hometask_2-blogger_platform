import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateQuestionDomainDto } from '../../domain/dto/update-question-domain.dto';
import { QuestionsRepository } from '../../infrastructure/repositories/questions.repo';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class UpdateQuestionCommand extends Command<void> {
  constructor(
    public id: string,
    public dto: UpdateQuestionDomainDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<
  UpdateQuestionCommand,
  void
> {
  constructor(private questionsRepo: QuestionsRepository) {}

  async execute({ id, dto }: UpdateQuestionCommand): Promise<void> {
    const questionInstance = await this.questionsRepo.findById(id);

    if (!questionInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This question with ID:${id} was not found`,
      });
    }

    questionInstance.update(dto);

    await this.questionsRepo.save(questionInstance);
  }
}
