import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { QuestionOrmEntity } from '../schemas/question-orm.entity';
import { QuestionViewModel } from '../../api/view-dto/question.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(QuestionOrmEntity)
    private readonly questionQueryRepo: Repository<QuestionOrmEntity>,
  ) {}

  async findById(questionId: string): Promise<QuestionViewModel | null> {
    const instanceQuestion = await this.questionQueryRepo.findOne({
      where: { id: questionId },
    });

    if (!instanceQuestion) return null;

    return QuestionViewModel.mapToView(instanceQuestion);
  }
}
