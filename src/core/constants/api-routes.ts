import { SortDirections } from 'src/blogs/api/dto/blogs-query.dto';

export const API_ROUTES = {
  blogs: 'blogs',
  comments: 'comments',
  posts: 'posts',
  testing: 'testing',
  users: 'users',
} as const;

export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_DIRECTION = SortDirections.DESC; // "default desc"
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
