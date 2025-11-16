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

type BlogPostInputDtoModel = Omit<PostInputDtoModel, "blogId">;

export {
  BlogViewModel,
  BlogPostInputDtoModel,
  BlogQueryParamInput,
  BlogListPaginatedOutput,
  BlogSortField,
};
