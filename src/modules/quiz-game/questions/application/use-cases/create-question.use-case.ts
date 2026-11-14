import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateQuestionDomainDto } from '../../domain/dto/create-question-domain.dto';
import { QuestionsRepository } from '../../infrastructure/repositories/questions.repo';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionDomainDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<
  CreateQuestionCommand,
  {
    id: string;
    body: string;
    correctAnswers: string[];
    published: boolean;
    createdAt: string;
    updatedAt: string | null;
  }
> {
  constructor(private questionsRepo: QuestionsRepository) {}

  async execute({ dto }: CreateQuestionCommand): Promise<{
    id: string;
    body: string;
    correctAnswers: string[];
    published: boolean;
    createdAt: string;
    updatedAt: string | null;
  }> {
    const instance = await this.questionsRepo.createQuestionBySA(dto);

    return {
      id: instance.id,
      body: instance.body,
      correctAnswers: instance.correctAnswers,
      published: instance.published,
      createdAt: instance.createdAt.toISOString(),
      updatedAt: instance.updatedAt?.toISOString() ?? null,
    };
  }
}
