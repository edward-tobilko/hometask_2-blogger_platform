import { PaginationSorting } from "../types/pagination-sorting.type";
import { SortDirections } from "../types/sort-directions.enum";

export const DEFAULT_SORT_BY = "createdAt";
export const DEFAULT_SORT_DIRECTION = SortDirections.DESC; // "default desc"
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;

const paginationAndSortingDefault: PaginationSorting<string> = {
  sortBy: DEFAULT_SORT_BY,
  sortDirection: DEFAULT_SORT_DIRECTION,
  pageNumber: DEFAULT_PAGE_NUMBER,
  pageSize: DEFAULT_PAGE_SIZE,
};

export function setDefaultSortAndPaginationIfNotExist<S = string>(
  queryParam: PaginationSorting<S>
): PaginationSorting<S> {
  return {
    sortBy: (queryParam.sortBy ?? paginationAndSortingDefault.sortBy) as S,
    sortDirection:
      queryParam.sortDirection ??
      (paginationAndSortingDefault.sortDirection as SortDirections),
    pageNumber: queryParam.pageNumber ?? paginationAndSortingDefault.pageNumber,
    pageSize: queryParam.pageSize ?? paginationAndSortingDefault.pageSize,
  };
}
