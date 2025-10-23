import { PaginationSorting } from "../../core/types/pagination-sorting.type";
import { PostInputDtoModel } from "../../posts/types/post.types";

enum BlogSortField {
  CreatedAt = "createdAt",
}

// * Output model
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

type BlogQueryParamInput = PaginationSorting<BlogSortField> &
  Partial<{ searchNameTerm: string; blogId: string }>;

// * DB models
type BlogDbDocument = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

// * Dto models
type BlogInputDtoModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

type BlogPostInputDtoModel = Omit<PostInputDtoModel, "blogId">;

export {
  BlogViewModel,
  BlogInputDtoModel,
  BlogPostInputDtoModel,
  BlogDbDocument,
  BlogQueryParamInput,
  BlogListPaginatedOutput,
  BlogSortField,
};
