import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { randomUUID } from 'crypto';

import { CreatePostDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/create-post.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import {
  PostsQueryDto,
  PostsSortBy,
} from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { SortDirections } from 'src/core/enums/sort-directions.enum';
import { UpdatePostDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/update-post.input-dto';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import {
  CommentsQueryDto,
  CommentsSortBy,
} from 'src/modules/bloggers-platform/comments/api/dto/input-dto/comments-query.input-dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';

export class PostTestManager {
  constructor(private readonly app: INestApplication) {}

  httpServer = this.app.getHttpServer() as Server;
  postsPath = `/${GLOBAL_PREFIX}/posts` as string;

  getPostInputDto(payloadValidation?: Record<string, unknown>): CreatePostDto {
    const UNIQUE_TITLE = randomUUID().slice(0, 20);
    const UNIQUE_SHORT_DESCRIPTION = randomUUID().slice(0, 50);
    const UNIQUE_CONTENT = randomUUID().slice(0, 100);
    const UNIQUE_BLOG_ID = randomUUID();

    const payloadBlogDto: CreatePostDto = {
      title: `Title ${UNIQUE_TITLE}`,
      shortDescription: `Short description ${UNIQUE_SHORT_DESCRIPTION}`,
      content: `Content ${UNIQUE_CONTENT}`,
      blogId: UNIQUE_BLOG_ID,
    };

    return { ...payloadBlogDto, ...payloadValidation }; // если одинаковый ключ есть в обоих объектах — правый перезаписывает левый.
  }

  async getPostsPaginatedList(
    optional: { query?: Partial<PostsQueryDto> } = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<PostsPaginatedViewModel> {
    const { query } = optional;

    const defaultQuery = {
      sortBy: PostsSortBy.CreatedAt,
      sortDirection: SortDirections.DESC,
      pageNumber: 1,
      pageSize: 10,

      ...query,
    };

    const response = await request(this.httpServer)
      .get(this.postsPath)
      .query(defaultQuery)
      .expect(statusCode);

    return response.body as PostsPaginatedViewModel;
  }

  async getPostById(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<PostViewModel> {
    const response = await request(this.httpServer)
      .get(`${this.postsPath}/${id}`)
      .expect(statusCode);

    return response.body as PostViewModel;
  }

  async getCommentsForPost(
    postId: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<any> {
    const response = await request(this.httpServer)
      .get(`${this.postsPath}/${postId}/comments`)
      .expect(statusCode);

    return response.body;
  }

  async createPost(
    dto: CreatePostDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewModel> {
    const response = await request(this.httpServer)
      .post(this.postsPath)
      .send(dto)
      .expect(statusCode);

    return response.body as PostViewModel;
  }

  async createSeveralPosts(
    blogId: string,
    count: number,
  ): Promise<PostViewModel[]> {
    const posts: PostViewModel[] = [];

    for (let i = 1; i <= count; i++) {
      const response = await request(this.httpServer)
        .post(`${this.postsPath}`)
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

  async createSeveralCommentsForPost(
    postId: string,
    accessToken: string,
    count: number,
  ): Promise<CommentViewModel[]> {
    const comments: CommentViewModel[] = [];

    for (let i = 1; i <= count; i++) {
      const response = await request(this.httpServer)
        .post(`${this.postsPath}/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: `Content ${i}`,
        })
        .expect(HttpStatus.CREATED);

      comments.push(response.body as CommentViewModel);
    }

    return comments;
  }

  async updatePost(
    id: string,
    dto: UpdatePostDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<UpdatePostDto> {
    const response = await request(this.httpServer)
      .put(`${this.postsPath}/${id}`)
      .send(dto)
      .expect(statusCode);

    return response.body as UpdatePostDto;
  }

  async deletePost(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .delete(`${this.postsPath}/${id}`)
      .expect(statusCode);
  }

  // * For comments contract
  async getCommentsForPostPaginatedList(
    postId: string,
    optional: { query?: Partial<CommentsQueryDto> } = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentsPaginatedViewModel> {
    const { query } = optional;

    const defaultQuery = {
      sortBy: CommentsSortBy.CreatedAt,
      sortDirection: SortDirections.DESC,
      pageNumber: 1,
      pageSize: 10,

      ...query,
    };

    const response = await request(this.httpServer)
      .get(`${this.postsPath}/${postId}/comments`)
      .query(defaultQuery)
      .expect(statusCode);

    return response.body as CommentsPaginatedViewModel;
  }
}
