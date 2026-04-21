export abstract class PaginatedViewDto<T> {
  pagesCount!: number;
  page!: number;
  pageSize!: number;
  totalCount!: number;

  abstract items: T;

  protected static basicMapper<T>(
    target: PaginatedViewDto<T>,
    data: {
      page: number;
      pageSize: number;
      totalCount: number;
      items: T;
    },
  ): PaginatedViewDto<T> {
    target.pagesCount = Math.ceil(data.totalCount / data.pageSize);
    target.page = data.page;
    target.pageSize = data.pageSize;
    target.totalCount = data.totalCount;

    target.items = data.items;

    return target;
  }
}
