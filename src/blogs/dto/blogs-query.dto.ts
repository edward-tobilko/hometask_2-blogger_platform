export enum SortDirections {
  ASC = 'asc', // ascending = (1)
  DESC = 'desc', // descending = (-1)
}

export type PaginationSorting<S> = {
  sortBy: S; // Available values -> see BlogSortField or PostSortField and so on...
  sortDirection: SortDirections;
  pageNumber: number; // Текущий номер страницы
  pageSize: number; // Количество элементов на странице
};

export enum BlogSortFieldRP {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export type BlogsQueryDto = PaginationSorting<BlogSortFieldRP> &
  Partial<{ searchNameTerm: string }>;

// ? <S> - дженерик, который мы указываем, что sortBy у нас будет по умолчанию «createdAt» - строка. <S> = BlogSortField или PostSortField
