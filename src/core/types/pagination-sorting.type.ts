import { SortDirections } from "./sort-directions.enum";

export type PaginationSorting<S> = {
  sortBy: S; // Available values -> see BlogSortField or PostSortField and so on...
  sortDirection: SortDirections;
  pageNumber: number; // Текущий номер страницы
  pageSize: number; // Количество элементов на странице
};

// ? <S> - дженерик, который мы указываем, что sortBy у нас будет по умолчанию «createdAt» - строка. <S> = BlogSortField или PostSortField
