import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateQuestionInputDto } from '../input-dto/create-question.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { CreateQuestionCommand } from '../../application/use-cases/create-question.use-case';
import { QuestionViewModel } from '../view-dto/question.view-dto';
import { GetQuestionByIdQuery } from '../../application/queries/get-question-by-id.query';
import { GetAllQuestionsQuery } from '../../application/queries/get-all-questions-query';
import { QuestionsListQueryInputDto } from '../input-dto/questions-list-query.input-dto';
import { QuestionsListPaginatedViewModel } from '../view-dto/questions-paginated.view-dto';
import { DeleteQuestionCommand } from '../../application/use-cases/delete-question.use-case';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';

@UseGuards(BasicAuthGuard)
@SkipThrottle()
@Controller(API_ROUTES.quizQuestions)
export class SaQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  // * Returns all questions with pagination and filtering.
  @Get()
  async getAllQuestions(
    @Query() queryDto: QuestionsListQueryInputDto,
  ): Promise<QuestionsListPaginatedViewModel> {
    const query = new GetAllQuestionsQuery(queryDto);

    return this.queryBus.execute(query);
  }

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

  // * Delete question.
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async deleteQuestion(
    @Param('id', UuidValidationPipe) id: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
