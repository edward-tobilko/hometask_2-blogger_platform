import { SortDirections } from "./sort-directions.enum";

export type PaginationSorting<S> = {
  sortBy: S;
  sortDirection: SortDirections;
  pageNumber: number;
  pageSize: number;
};
