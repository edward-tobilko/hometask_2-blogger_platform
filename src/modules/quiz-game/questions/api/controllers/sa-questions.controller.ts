import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateQuestionInputDto } from '../input-dto/create-question.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { CreateQuestionCommand } from '../../application/use-cases/create-question.use-case';
import { QuestionViewModel } from '../view-dto/question.view-dto';
import { GetQuestionByIdQuery } from '../../application/queries/get-question-by-id.query';

@UseGuards(BasicAuthGuard)
@SkipThrottle()
@Controller(API_ROUTES.quizQuestions)
export class SaQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  // * Create question.
  @Post()
  async createQuestion(
    @Body() dto: CreateQuestionInputDto,
  ): Promise<QuestionViewModel> {
    const command = new CreateQuestionCommand({
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });

    const { id } = await this.commandBus.execute(command);

    const query = new GetQuestionByIdQuery(id);

    return this.queryBus.execute(query);
  }
}
