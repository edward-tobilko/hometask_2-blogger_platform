import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateQuestionInputDto } from '../input-dto/create-question.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { CreateQuestionCommand } from '../../application/use-cases/create-question.use-case';
import { QuestionViewModel } from '../view-dto/question.view-dto';

@UseGuards(BasicAuthGuard)
@SkipThrottle()
@Controller(API_ROUTES.quizQuestions)
export class SaQuestionsController {
  constructor(private commandBus: CommandBus) {}

  // * Create question.
  @Post()
  async createQuestion(
    @Body() dto: CreateQuestionInputDto,
  ): Promise<QuestionViewModel> {
    const command = new CreateQuestionCommand({
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });

    return this.commandBus.execute(command);
  }
}
