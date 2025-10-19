import { PaginationSorting } from "../../core/types/pagination-sorting.type";

type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

type BlogListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogViewModel[];
};

type BlogDbDocument = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

type BlogInputDtoModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

type BlogPostInputDtoModel = {
  title: string;
  shortDescription: string;
  content: string;
};

enum BlogSortField {
  CreatedAt = "createdAt",
}

type BlogQueryParamInput = PaginationSorting<BlogSortField> &
  Partial<{ searchNameTerm: string }>;

export {
  BlogViewModel,
  BlogInputDtoModel,
  BlogPostInputDtoModel,
  BlogDbDocument,
  BlogQueryParamInput,
  BlogListPaginatedOutput,
  BlogSortField,
};
