import { PaginationSorting } from "../../../core/types/pagination-sorting.type";
import { PostInputDtoModel } from "../../../posts/types/post.types";

enum BlogSortField {
  CreatedAt = "createdAt",
}

export type GetBlogsListQueryHandler = PaginationSorting<BlogSortField> &
  Partial<{ searchNameTerm: string; blogId: string }>;

export type BlogPostInputDtoModel = Omit<PostInputDtoModel, "blogId">;
