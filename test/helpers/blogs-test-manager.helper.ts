import { HttpStatus, INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { Server } from 'http';

import { CreateBlogDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/create-blog.input-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import {
  BlogsQueryDto,
  BlogsSortBy,
} from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { BlogListPaginatedViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blogs-paginated.view-dto';
import { SortDirections } from 'src/core/enums/sort-directions.enum';
import { UpdateBlogDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/update-blog.input-dto';
import { CreatePostForBlogDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/create-post-for-blog.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostTestManager } from './posts-test-manager.helper';

export class BlogTestManager {
  constructor(
    private readonly app: INestApplication,

    private postTestManager: PostTestManager,
  ) {}

  private readonly ADMIN_LOGIN = 'admin';
  private readonly ADMIN_PASSWORD = 'qwerty';

  httpServer = this.app.getHttpServer() as Server;
  blogsPath = `/${GLOBAL_PREFIX}/blogs` as string;
  saBlogsPath = `/${GLOBAL_PREFIX}/sa/blogs` as string;
  postsPath = `/${GLOBAL_PREFIX}/posts` as string;

  getBlogInputDto(payloadValidation?: Record<string, unknown>): CreateBlogDto {
    const UNIQUE_NAME = randomUUID().slice(0, 10);
    const UNIQUE_DESCRIPTION = randomUUID().slice(0, 50);
    const UNIQUE_WEBSITE = randomUUID().slice(0, 10);

    const payloadBlogDto: CreateBlogDto = {
      name: `Name ${UNIQUE_NAME}`,
      description: `Description ${UNIQUE_DESCRIPTION}`,
      websiteUrl: `https://${UNIQUE_WEBSITE}.example.com`,
    };

    return { ...payloadBlogDto, ...payloadValidation }; // если одинаковый ключ есть в обоих объектах — правый перезаписывает левый.
  }

  getPostForBlogInputDto(payloadValidation?: Record<string, unknown>) {
    const { blogId, ...dto } =
      this.postTestManager.getPostInputDto(payloadValidation);

    void blogId; // решение по ESLint ('blogId' is assigned a value but never used -> хотя мы blogId исп. в .getPostInputDto)

    return dto;
  }

  async getBlogsPaginatedList(
    optional: { query?: Partial<BlogsQueryDto> } = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<BlogListPaginatedViewModel> {
    const { query } = optional;

    const defaultQuery = {
      sortBy: BlogsSortBy.CreatedAt,
      sortDirection: SortDirections.DESC,
      pageNumber: 1,
      pageSize: 10,

      ...query,
    };

    const blogsList = await request(this.httpServer)
      .get(this.blogsPath)
      .query(defaultQuery)
      .expect(statusCode);

    return blogsList.body as BlogListPaginatedViewModel;
  }

  async getPostsForBlogPaginatedList(
    blogId: string,
    optional: { query?: Partial<BlogsQueryDto> } = {},
    statusCode: number = HttpStatus.OK,
    accessToken?: string, // for dynamic status
  ): Promise<PostsPaginatedViewModel> {
    const { query } = optional;

    const defaultQuery = {
      sortBy: BlogsSortBy.CreatedAt,
      sortDirection: SortDirections.DESC,
      pageNumber: 1,
      pageSize: 10,

      ...query,
    };

    const requestResult = request(this.httpServer)
      .get(`${this.blogsPath}/${blogId}/posts`)
      .query(defaultQuery);

    if (accessToken) {
      requestResult.set('Authorization', `Bearer ${accessToken}`);
    }

    const postsForBlogList = await requestResult.expect(statusCode);

    return postsForBlogList.body as PostsPaginatedViewModel;
  }

  async getBlogById(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<BlogViewModel> {
    const response = await request(this.httpServer)
      .get(`${this.blogsPath}/${id}`)
      .expect(statusCode);

    return response.body as BlogViewModel;
  }

  async createBlog(
    dto: CreateBlogDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogViewModel> {
    const response = await request(this.httpServer)
      .post(`${this.saBlogsPath}`)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .send(dto)
      .expect(statusCode);

    return response.body as BlogViewModel;
  }

  async createSeveralBlogs(count: number): Promise<BlogViewModel[]> {
    const blogs: BlogViewModel[] = [];

    for (let i = 1; i <= count; i++) {
      // * делаем последовательное создание 12-ти блогов (лучше для тестов)
      const response = await this.createBlog({
        name: `name${i}`,
        description: `description ${i}`,
        websiteUrl: `https://${i}.example.com`,
      });

      blogs.push(response);
    }

    return blogs;
  }

  async createPostForBlog(
    blogId: string,
    dto: CreatePostForBlogDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewModel> {
    const response = await request(this.httpServer)
      .post(`${this.saBlogsPath}/${blogId}/posts`)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .send(dto)
      .expect(statusCode);

    return response.body as PostViewModel;
  }

  async createSeveralPostsForBlog(
    blogId: string,
    count: number,
  ): Promise<PostViewModel[]> {
    const posts: PostViewModel[] = [];

    for (let i = 1; i <= count; i++) {
      const response = await request(this.httpServer)
        .post(`${this.saBlogsPath}/${blogId}/posts`)
        .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
        .send({
          title: `Title ${i}`,
          shortDescription: `Short description ${i}`,
          content: `Content ${i}`,
          blogId,
        })
        .expect(HttpStatus.CREATED);

      posts.push(response.body as PostViewModel);
    }

    return posts;
  }

  async updateBlog(
    id: string,
    dto: UpdateBlogDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<UpdateBlogDto> {
    const response = await request(this.httpServer)
      .put(`${this.saBlogsPath}/${id}`)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .send(dto)
      .expect(statusCode);

    return response.body as UpdateBlogDto;
  }

  async deleteBlog(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .delete(`${this.saBlogsPath}/${id}`)
      .auth(this.ADMIN_LOGIN, this.ADMIN_PASSWORD)
      .expect(statusCode);
  }
}
