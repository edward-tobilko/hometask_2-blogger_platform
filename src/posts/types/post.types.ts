import { ObjectId } from "mongodb";

import { PaginationSorting } from "../../core/types/pagination-sorting.type";

export enum PostSortField {
  CreatedAt = "createdAt",
}

// * Output models
export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type PostForBlogListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewModel[];
};

export type PostQueryParamInput = PaginationSorting<PostSortField>;

// * DataBase models
export type PostDbDocument = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
};

// * Dto models
export type PostInputDtoModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
