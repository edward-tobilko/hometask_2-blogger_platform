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

  async save(entity: QuestionOrmEntity): Promise<QuestionOrmEntity> {
    return this.questionRepo.save(entity);
  }

  async findById(id: string): Promise<QuestionOrmEntity | null> {
    return this.questionRepo.findOneBy({ id });
  }

  async createBySA(dto: CreateQuestionDomainDto): Promise<QuestionOrmEntity> {
    const questionInstance = QuestionOrmEntity.createQuestion(dto);

    return this.questionRepo.save(questionInstance);
  }

  async deleteBySA(id: string): Promise<boolean> {
    const result = await this.questionRepo.delete(id);

    return result.affected === 1; // TypeORM отдаёт число в DeleteResult.affected -> 1 - удалили, отдаём 204 /  0 — ничего не удалили, отдаём 404;
  }
}
