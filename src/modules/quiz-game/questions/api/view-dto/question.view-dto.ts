import { QuestionOrmEntity } from '../../infrastructure/schemas/question-orm.entity';

export class QuestionViewModel {
  id!: string;
  body!: string;
  correctAnswers!: string[];
  published!: boolean;
  createdAt!: string;
  updatedAt!: string | null;

  static mapToView(entity: QuestionOrmEntity): QuestionViewModel {
    const dto = new QuestionViewModel();

    dto.id = entity.id;
    dto.body = entity.body;
    dto.correctAnswers = entity.correctAnswers;
    dto.published = entity.published;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt?.toISOString() ?? null;

    return dto;
  }
}
