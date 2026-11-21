import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { QuestionOrmEntity } from '../schemas/question-orm.entity';
import { QuestionViewModel } from '../../api/view-dto/question.view-dto';
import { QuestionsListQueryInputDto } from '../../api/input-dto/questions-list-query.input-dto';
import { QuestionsListPaginatedViewModel } from '../../api/view-dto/questions-paginated.view-dto';
import { escapeLike } from 'src/core/utils/escape-like.util';
import { PublishedStatus } from 'src/core/enums/published-status.enum';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(QuestionOrmEntity)
    private readonly questionQueryRepo: Repository<QuestionOrmEntity>,
  ) {}

  async findAll(
    queryParams: QuestionsListQueryInputDto,
  ): Promise<QuestionsListPaginatedViewModel> {
    const { pageSize, pageNumber, bodySearchTerm, publishedStatus } =
      queryParams;

    const where: FindOptionsWhere<QuestionOrmEntity> = {};

    if (bodySearchTerm) where.body = ILike(`%${escapeLike(bodySearchTerm)}%`);

    if (publishedStatus === PublishedStatus.NOT_PUBLISHED) {
      where.published = false;
    } else if (publishedStatus === PublishedStatus.PUBLISHED) {
      where.published = true;
    }

    const [questions, totalCount] = await this.questionQueryRepo.findAndCount({
      where,
      order: { ...queryParams.calculateSort(), id: 'ASC' }, // последовательная сортировка (по id), если будут одинаковые вопроссы (body);
      skip: queryParams.calculateSkip(),
      take: pageSize,
    });

    return QuestionsListPaginatedViewModel.mapToView({
      page: pageNumber,
      pageSize,
      totalCount,

      items: questions.map((question) => QuestionViewModel.mapToView(question)),
    });
  }

  async findById(questionId: string): Promise<QuestionViewModel | null> {
    const instanceQuestion = await this.questionQueryRepo.findOne({
      where: { id: questionId },
    });

    if (!instanceQuestion) return null;

    return QuestionViewModel.mapToView(instanceQuestion);
  }
}
