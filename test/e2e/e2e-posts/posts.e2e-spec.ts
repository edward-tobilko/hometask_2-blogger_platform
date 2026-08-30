import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';

import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { PostTestManager } from 'test/helpers/posts-test-manager.helper';
import { BadRequestError } from '../utils/bad-request-error.util';
import { BlogTestManager } from 'test/helpers/blogs-test-manager.helper';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { SortDirections } from 'src/core/enums/sort-directions.enum';
import { PostsSortBy } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { UpdatePostDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/update-post.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { CommentsSortBy } from 'src/modules/bloggers-platform/comments/api/dto/input-dto/comments-query.input-dto';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from 'src/modules/bloggers-platform/posts/api/constraints/posts.constraints';
import { LikeStatus } from 'src/core/enums/like-status.enum';
import { commentsContentConstraints } from 'src/modules/bloggers-platform/comments/api/constraints/comments.constraints';

describe('Posts swagger contract', () => {
  let app: INestApplication;

  let postTestManager: PostTestManager;
  let blogTestManager: BlogTestManager;
  let authTestManager: UserTestManager;

  let createdBlog: BlogViewModel;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    postTestManager = result.postTestManager;
    blogTestManager = result.blogTestManager;
    authTestManager = result.userTestManager;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => {
    await deleteAllData(app);

    const dto = blogTestManager.getBlogInputDto();

    createdBlog = await blogTestManager.createBlog(dto);
  });

  describe.skip('Tests for PUT: /api/posts/{postId}/like-status end-point', () => {
    let createdPost: PostViewModel;
    let accessToken: string;

    beforeEach(async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });

      createdPost = await postTestManager.createPost(dto);

      const user = await authTestManager.getRegisteredAndConfirmedUser();

      const { accessToken: token } = await authTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      accessToken = token;
    });

    it('status 204 - should set like status', async () => {
      // * ставим лайк
      await postTestManager.updateLikeStatus(
        createdPost.id,
        LikeStatus.Like,
        accessToken,
      );

      // * выводим результат
      const post = await postTestManager.getPostById(createdPost.id);

      expect(post.extendedLikesInfo.likesCount).toBe(1);
      expect(post.extendedLikesInfo.myStatus).toBe('None'); // без токена -> "None"
    });

    it('status 204 - should set dislike status', async () => {
      await postTestManager.updateLikeStatus(
        createdPost.id,
        LikeStatus.Dislike,
        accessToken,
      );

      const post = await postTestManager.getPostById(createdPost.id);

      expect(post.extendedLikesInfo.dislikesCount).toBe(1);
      expect(post.extendedLikesInfo.myStatus).toBe('None');
    });

    it('status 204 - should reset status to "None"', async () => {
      await postTestManager.updateLikeStatus(
        createdPost.id,
        LikeStatus.None,
        accessToken,
      );

      const post = await postTestManager.getPostById(createdPost.id);

      expect(post.extendedLikesInfo.likesCount).toBe(0);
      expect(post.extendedLikesInfo.dislikesCount).toBe(0);
      expect(post.extendedLikesInfo.myStatus).toBe('None');
    });

    it('status 204 - myStatus reflects like for authorized user', async () => {
      await postTestManager.updateLikeStatus(
        createdPost.id,
        LikeStatus.Like,
        accessToken,
      );

      const post = await postTestManager.getPostById(
        createdPost.id,
        HttpStatus.OK,
        accessToken,
      );
      expect(post.extendedLikesInfo.myStatus).toBe('Like');
    });

    it('status 401 - if no auth token provided', async () => {
      await postTestManager.updateLikeStatus(
        createdPost.id,
        LikeStatus.Like,
        'invalid_token',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 404 - if post not found', async () => {
      await postTestManager.updateLikeStatus(
        '00000000-0000-0000-0000-000000000000',
        LikeStatus.Like,
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });

    it('status 400 - if likeStatus is invalid', async () => {
      const result = await request(app.getHttpServer() as Server)
        .put(`/api/posts/${createdPost.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'invalid' })
        .expect(HttpStatus.BAD_REQUEST);

      const body = result.body as BadRequestError;

      expect(body.errorsMessages[0].field).toBe('likeStatus');
    });
  });

  describe.skip('Tests for POST: /api/posts/{postId}/comments', () => {
    let post: PostViewModel;
    let accessToken: string;

    beforeEach(async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });

      post = await postTestManager.createPost(dto);

      const { login, password } =
        await authTestManager.getRegisteredAndConfirmedUser();

      const { accessToken: token } = await authTestManager.login({
        loginOrEmail: login,
        password,
      });

      accessToken = token;
    });

    it('status - 201 should return created post', async () => {
      const comments = await postTestManager.createSeveralCommentsForPost(
        post.id,
        accessToken,
        1,
      );

      expect(comments[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          commentatorInfo: expect.objectContaining({
            userId: expect.any(String),
            userLogin: expect.any(String),
          }),
          createdAt: expect.any(String),
          likesInfo: expect.objectContaining({
            likesCount: expect.any(Number),
            dislikesCount: expect.any(Number),
            myStatus: expect.any(String),
          }),
        }),
      );
    });

    it.each([
      {
        name: 'content is not a string',
        payload: {
          content: 123,
        },
        field: 'content',
      },
      {
        name: 'content length < 20 symbols',
        payload: {
          content: 'a'.repeat(commentsContentConstraints.minLength - 1),
        },
        field: 'content',
      },
      {
        name: 'content length > 300 symbols',
        payload: {
          content: 'a'.repeat(commentsContentConstraints.maxLength + 1),
        },
        field: 'content',
      },
    ] as const)(
      'status 400 - should not create comment if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const result = await request(app.getHttpServer() as Server)
          .post(`/api/posts/${post.id}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(payload)
          .expect(HttpStatus.BAD_REQUEST);

        const body = result.body as BadRequestError;

        expect(body.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it('status - 401 if unauthorized', async () => {
      await request(app.getHttpServer() as Server)
        .post(`/api/posts/${post.id}/comments`)
        .send({
          content: `This content include 30+ symbols`,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("status - 404 if post with specified postId doesn't exists", async () => {
      const notExistingPostId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer() as Server)
        .post(`/api/posts/${notExistingPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: `This content include 30+ symbols`,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe.skip(`Tests for GET: /api/posts/{postId}/comments end-point`, () => {
    let createdPost: PostViewModel;
    let accessToken: string;

    beforeEach(async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });

      createdPost = await postTestManager.createPost(dto);

      const { login, password } =
        await authTestManager.getRegisteredAndConfirmedUser();

      const { accessToken: token } = await authTestManager.login({
        loginOrEmail: login,
        password,
      });

      accessToken = token;
    });

    it('status 200 - should return comments list for post (12 paginated comments)', async () => {
      await postTestManager.createSeveralCommentsForPost(
        createdPost.id,
        accessToken,
        12,
      );

      const page1 = await postTestManager.getCommentsForPostPaginatedList(
        createdPost.id,
        {
          query: {
            pageNumber: 1,
            pageSize: 10,
          },
        },
      );

      expect(page1.totalCount).toBe(12);
      expect(page1.pagesCount).toBe(2);
      expect(page1.items).toHaveLength(10);

      // * проверяем структуру первого элемента
      expect(page1.items[0]).toEqual({
        id: expect.any(String),
        content: expect.any(String),

        commentatorInfo: expect.objectContaining({
          userId: expect.any(String),
          userLogin: expect.any(String),
        }),

        createdAt: expect.any(String),

        likesInfo: expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
        }),
      });

      const page2 = await postTestManager.getCommentsForPostPaginatedList(
        createdPost.id,
        {
          query: { pageNumber: 2, pageSize: 10 },
        },
      );

      expect(page2.totalCount).toBe(12);
      expect(page2.pagesCount).toBe(2);
      expect(page2.items).toHaveLength(2);
    });

    it('status 200 - should return empty list', async () => {
      const result = await postTestManager.getCommentsForPostPaginatedList(
        createdPost.id,
      );

      expect(result.totalCount).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('status 404 - if specificity post is not exists', async () => {
      const notExistingPostId = '00000000-0000-0000-0000-000000000000';

      await postTestManager.getCommentsForPostPaginatedList(
        notExistingPostId,
        undefined,
        HttpStatus.NOT_FOUND,
      );
    });

    it('status 200 - sorting comments by sortDirection and sortBy', async () => {
      await postTestManager.createSeveralCommentsForPost(
        createdPost.id,
        accessToken,
        3,
      );

      const ascResult = await postTestManager.getCommentsForPostPaginatedList(
        createdPost.id,
        {
          query: {
            sortDirection: SortDirections.ASC,
            sortBy: CommentsSortBy.CreatedAt,
          },
        },
      );
      const descResult = await postTestManager.getCommentsForPostPaginatedList(
        createdPost.id,
        {
          query: {
            sortDirection: SortDirections.DESC,
            sortBy: CommentsSortBy.CreatedAt,
          },
        },
      );

      expect(
        new Date(ascResult.items[0].createdAt) <=
          new Date(ascResult.items[1].createdAt),
      ).toBe(true);
      expect(
        new Date(descResult.items[0].createdAt) >=
          new Date(descResult.items[1].createdAt),
      ).toBe(true);
    });
  });

  describe('Tests for GET: /api/posts end-point', () => {
    let accessToken: string;

    beforeEach(async () => {
      const user = await authTestManager.getRegisteredAndConfirmedUser();

      const { accessToken: token } = await authTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      accessToken = token;
    });

    it('status 200 - should return paginated posts list', async () => {
      await postTestManager.createSeveralPosts(createdBlog.id, 12);

      const page1 = await postTestManager.getPostsPaginatedList({
        query: {
          pageNumber: 1,
          pageSize: 10,
        },
      });

      expect(page1.totalCount).toBe(12);
      expect(page1.pagesCount).toBe(2);
      expect(page1.items).toHaveLength(10);

      // * проверяем структуру первого элемента
      expect(page1.items[0]).toEqual({
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),

        extendedLikesInfo: expect.objectContaining({
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),

          newestLikes: expect.any(Array),
        }),
      });

      // * на 2й сторанице -> pageSize=2 (totalCount=12, pagesCount=2)
      const page2 = await postTestManager.getPostsPaginatedList({
        query: { pageNumber: 2, pageSize: 10 },
      });

      expect(page2.totalCount).toBe(12);
      expect(page2.pagesCount).toBe(2);
      expect(page2.items).toHaveLength(2);
    });

    it('status 200 - should return empty list', async () => {
      const result = await postTestManager.getPostsPaginatedList();

      expect(result.totalCount).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('status 200 - sorting posts by sortDirection and sortBy', async () => {
      await postTestManager.createSeveralPosts(createdBlog.id, 3);

      const ascResult = await postTestManager.getPostsPaginatedList({
        query: {
          sortDirection: SortDirections.ASC,
          sortBy: PostsSortBy.CreatedAt,
        },
      });
      const descResult = await postTestManager.getPostsPaginatedList({
        query: {
          sortDirection: SortDirections.DESC,
          sortBy: PostsSortBy.CreatedAt,
        },
      });

      expect(
        new Date(ascResult.items[0].createdAt) <=
          new Date(ascResult.items[1].createdAt),
      ).toBe(true);
      expect(
        new Date(descResult.items[0].createdAt) >=
          new Date(descResult.items[1].createdAt),
      ).toBe(true);
    });

    it.skip('status 200 - myStatus reflects user like for authorized user', async () => {
      const posts = await postTestManager.createSeveralPosts(createdBlog.id, 1);

      await postTestManager.updateLikeStatus(posts[0].id, 'Like', accessToken);

      const result = await postTestManager.getPostsPaginatedList(
        {},
        HttpStatus.OK,
        accessToken,
      );

      expect(result.items[0].extendedLikesInfo.myStatus).toBe('Like');
    });
  });

  describe('Tests for POST: /api/posts/ end-point', () => {
    it('status 201 - should create post for blog', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });
      const result = await postTestManager.createPost(dto);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
          blogName: createdBlog.name,
          createdAt: expect.any(String),
        }),
      );
    });

    it('status 404 - if blogId does not exist', async () => {
      const nonExistingBlogId = '00000000-0000-0000-0000-000000000000';

      const dto = postTestManager.getPostInputDto({
        blogId: nonExistingBlogId,
      });

      await postTestManager.createPost(dto, HttpStatus.NOT_FOUND);
    });

    it.each([
      // * title validation
      {
        name: 'title is not a string',
        payload: { title: 123 },
        field: 'title',
      },
      {
        name: 'title length > 30 symbols',
        payload: { title: 'a'.repeat(titleConstraints.maxLength + 1) },
        field: 'title',
      },

      // * shortDescription validation
      {
        name: 'shortDescription is not a string',
        payload: { shortDescription: 123 },
        field: 'shortDescription',
      },
      {
        name: 'shortDescription length > 100 symbols',
        payload: {
          shortDescription: 'a'.repeat(
            shortDescriptionConstraints.maxLength + 1,
          ),
        },
        field: 'shortDescription',
      },

      // * content validation
      {
        name: 'content is not a string',
        payload: {
          content: 123,
        },
        field: 'content',
      },
      {
        name: 'content length > 1000 symbols',
        payload: { content: 'a'.repeat(contentConstraints.maxLength + 1) },
        field: 'content',
      },

      // * blogId validation
      {
        name: 'blogId is not a string',
        payload: { blogId: 123 },
        field: 'blogId',
      },
      {
        name: 'blogId is not a valid UUID',
        payload: { blogId: 'not-an-id' },
        field: 'blogId',
      },
    ] as const)(
      'status 400 - should not create post if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const dto = postTestManager.getPostInputDto(payload);
        const result = await postTestManager.createPost<BadRequestError>(
          dto,
          HttpStatus.BAD_REQUEST,
        );

        expect(result.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it('status - 401 if without basic authorization', async () => {
      const dto = postTestManager.getPostInputDto();

      await request(app.getHttpServer() as Server)
        .post('/api/posts')
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for GET: /api/posts/{id} end-point', () => {
    it('status 200 - should return one post by id', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });
      const result = await postTestManager.createPost(dto);

      const blogIdRes = await postTestManager.getPostById(result.id);

      expect(blogIdRes).toEqual(result);
    });

    it('status 404 - if post not found', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });

      await postTestManager.createPost(dto);

      await postTestManager.getPostById(
        '00000000-0000-0000-0000-000000000000',
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('Tests for PUT: /api/posts/{id} end-point', () => {
    it('status 204 - should update post by id', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });
      const result = await postTestManager.createPost(dto);

      const updatedPostDto: UpdatePostDto = {
        ...dto,

        title: 'Updated title',
        shortDescription: 'updated short desc',
        content: 'Updated content',
      };

      await postTestManager.updatePost(result.id, updatedPostDto);

      const updatedPostResponse = await postTestManager.getPostById(result.id);

      expect(updatedPostResponse).toEqual(
        expect.objectContaining({
          title: updatedPostDto.title,
          shortDescription: updatedPostDto.shortDescription,
          content: updatedPostDto.content,
          blogId: dto.blogId,
        }),
      );
    });

    it('status 404 - if post not found', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });

      await postTestManager.createPost(dto);

      await postTestManager.updatePost(
        '00000000-0000-0000-0000-000000000000',
        dto,
        HttpStatus.NOT_FOUND,
      );
    });

    it.each([
      // * title validation
      {
        name: 'title is not a string',
        payload: { title: 123 },
        field: 'title',
      },
      {
        name: 'title length > 30 symbols',
        payload: { title: 'a'.repeat(titleConstraints.maxLength + 1) },
        field: 'title',
      },

      // * shortDescription validation
      {
        name: 'shortDescription is not a string',
        payload: { shortDescription: 123 },
        field: 'shortDescription',
      },
      {
        name: 'shortDescription length > 100 symbols',
        payload: {
          shortDescription: 'a'.repeat(
            shortDescriptionConstraints.maxLength + 1,
          ),
        },
        field: 'shortDescription',
      },

      // * content validation
      {
        name: 'content is not a string',
        payload: {
          content: 123,
        },
        field: 'content',
      },
      {
        name: 'content length > 1000 symbols',
        payload: { content: 'a'.repeat(contentConstraints.maxLength + 1) },
        field: 'content',
      },

      // * blogId validation
      {
        name: 'blogId is not a string',
        payload: { blogId: 123 },
        field: 'blogId',
      },
      {
        name: 'blogId is not a valid UUID',
        payload: { blogId: 'not-an-id' },
        field: 'blogId',
      },
    ] as const)(
      'status 400 - should not create post if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const validDto = postTestManager.getPostInputDto({
          blogId: createdBlog.id,
        });
        const createdPost = await postTestManager.createPost(validDto);

        const invalidDto = postTestManager.getPostInputDto(payload);
        const result = await postTestManager.updatePost<BadRequestError>(
          createdPost.id,
          invalidDto,
          HttpStatus.BAD_REQUEST,
        );

        expect(result.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it('status - 401 if without basic authorization', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });
      const post = await postTestManager.createPost(dto);

      await request(app.getHttpServer() as Server)
        .put(`/api/posts/${post.id}`)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for DELETE: /api/posts/{id} end-point', () => {
    it('status 204 - should remove post by id and check after NOT FOUND', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });
      const result = await postTestManager.createPost(dto);

      await postTestManager.deletePost(result.id);

      await postTestManager.getPostById(result.id, HttpStatus.NOT_FOUND);
    });

    it('status 404 - if post not found', async () => {
      const invalidPostId = '00000000-0000-0000-0000-000000000000';

      await postTestManager.deletePost(invalidPostId, HttpStatus.NOT_FOUND);
    });

    it('status - 401 if without basic authorization', async () => {
      const dto = postTestManager.getPostInputDto({ blogId: createdBlog.id });
      const post = await postTestManager.createPost(dto);

      await request(app.getHttpServer() as Server)
        .delete(`/api/posts/${post.id}`)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
