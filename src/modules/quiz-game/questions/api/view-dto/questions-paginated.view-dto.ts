import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { QuestionViewModel } from './question.view-dto';

export class QuestionsListPaginatedViewModel extends PaginatedViewDto<
  QuestionViewModel[]
> {
  items!: QuestionViewModel[];

  static mapToView(data: {
    page: number;
    pageSize: number;
    totalCount: number;
    items: QuestionViewModel[];
  }) {
    return super.basicMapper(new QuestionsListPaginatedViewModel(), data);
  }
}
