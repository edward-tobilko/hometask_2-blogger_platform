import { UserViewDto } from './user-view.dto';

export class UsersListPaginatedViewModel {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,

    public items: UserViewDto[],
  ) {}
}
