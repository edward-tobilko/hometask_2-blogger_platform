import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateQuestionDomainDto } from '../../domain/dto/create-question-domain.dto';
import { QuestionsRepository } from '../../infrastructure/repositories/questions.repo';

export class CreateQuestionCommand extends Command<{ id: string }> {
  constructor(public dto: CreateQuestionDomainDto) {
    super();
  }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<
  CreateQuestionCommand,
  {
    id: string;
  }
> {
  constructor(private questionsRepo: QuestionsRepository) {}

  async execute({ dto }: CreateQuestionCommand): Promise<{
    id: string;
  }> {
    const instance = await this.questionsRepo.createQuestionBySA(dto);

    return {
      id: instance.id,
    };
  }
}
