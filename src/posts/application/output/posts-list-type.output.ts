import { PostOutput } from "./post-type.output";

export type PostsListPaginatedOutput = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  items: PostOutput[];
};
