import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { QuestionOrmEntity } from '../schemas/question-orm.entity';
import { CreateQuestionDomainDto } from '../../domain/dto/create-question-domain.dto';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionOrmEntity)
    private questionRepo: Repository<QuestionOrmEntity>,
  ) {}

  async createQuestionBySA(
    dto: CreateQuestionDomainDto,
  ): Promise<QuestionOrmEntity> {
    const questionInstance = QuestionOrmEntity.createQuestion(dto);

    return this.questionRepo.save(questionInstance);
  }
}
