import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateQuestionDomainDto } from '../../domain/dto/create-question-domain.dto';

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
    updatedAt: string;
  }
> {
  async execute({ dto }: CreateQuestionCommand): Promise<{
    id: string;
    body: string;
    correctAnswers: string[];
    published: boolean;
    createdAt: string;
    updatedAt: string;
  }> {
    const existingObj = {
      id: '1',
      body: dto.body,
      correctAnswers: dto.correctAnswers,
      published: false,
      createdAt: '2026-11-13T20:27:50.396Z',
      updatedAt: '2026-11-13T20:27:50.396Z',
    };

    return existingObj;
  }
}
