import { HttpStatus, INestApplication } from '@nestjs/common';

import { CommentTestManager } from 'test/helpers/comments-test-manager.helper';
import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { PostTestManager } from 'test/helpers/posts-test-manager.helper';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { BlogTestManager } from 'test/helpers/blogs-test-manager.helper';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';
import { UpdateCommentDto } from 'src/modules/bloggers-platform/comments/api/dto/input-dto/update-comment.input-dto';
import { commentsContentConstraints } from 'src/modules/bloggers-platform/comments/constraints/comments.constraints';
import { BadRequestError } from '../utils/bad-request-error.util';
import { LikeStatus } from 'src/core/enums/like-status.enum';

describe('Comments swagger contract', () => {
  let app: INestApplication;

  let commentTestManager: CommentTestManager;
  let postTestManager: PostTestManager;
  let blogTestManager: BlogTestManager;
  let authTestManager: UserTestManager;

  let createdBlog: BlogViewModel;
  let createdComment: CommentViewModel;
  let createdPost: PostViewModel;

  let accessToken: string;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    commentTestManager = result.commentTestManager;
    postTestManager = result.postTestManager;
    blogTestManager = result.blogTestManager;
    authTestManager = result.userTestManager;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => {
    await deleteAllData(app);

    const blogDto = blogTestManager.getBlogInputDto();

    createdBlog = await blogTestManager.createBlog(blogDto);

    const postDto = postTestManager.getPostInputDto({
      blogId: createdBlog.id,
    });

    createdPost = await postTestManager.createPost(postDto);

    const { login, password } =
      await authTestManager.getRegisteredAndConfirmedUser();

    const { accessToken: token } = await authTestManager.login({
      loginOrEmail: login,
      password,
    });

    accessToken = token;

    const comments = await postTestManager.createSeveralCommentsForPost(
      createdPost.id,
      accessToken,
      1,
    );

    createdComment = comments[0];
  });

  describe('Tests for PUT: /api/comments/{commentId}/like-status end-point', () => {
    it('status 204 - Like successfully set', async () => {
      await commentTestManager.setLikeStatus(
        createdComment.id,
        LikeStatus.Like,
        accessToken,
      );
    });

    it('status 204 - Dislike successfully set', async () => {
      await commentTestManager.setLikeStatus(
        createdComment.id,
        LikeStatus.Dislike,
        accessToken,
      );
    });

    it('status 204 - None successfully set (reset)', async () => {
      await commentTestManager.setLikeStatus(
        createdComment.id,
        LikeStatus.None,
        accessToken,
      );
    });

    it('status 401 - if unauthorized', async () => {
      await commentTestManager.setLikeStatus(
        createdComment.id,
        LikeStatus.Like,
        undefined,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it("status 404 - if comment with specified id doesn't exists", async () => {
      await commentTestManager.setLikeStatus(
        '000000000000000000000000',
        LikeStatus.Like,
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });

    it.each([
      {
        name: 'likeStatus is not an enum',
        payload: 'not-a-valid-status',
        field: 'likeStatus',
      },
    ])(
      'status 400 - if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const result = await commentTestManager.setLikeStatus<BadRequestError>(
          createdComment.id,
          payload,
          accessToken,
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
  });

  describe('Tests for PUT: /api/comments/{commentId} end-point', () => {
    let dto: UpdateCommentDto;

    beforeEach(() => {
      dto = commentTestManager.getCommentInputDto();
    });

    it('status 204 - comment successfully updated', async () => {
      const updatedCommentDto: UpdateCommentDto = {
        content: 'This updated comment includes min 30 characters',
      };

      await commentTestManager.updateCommentById(
        createdComment.id,
        updatedCommentDto,
        accessToken,
      );
    });

    it('status 401 - if unauthorized', async () => {
      await commentTestManager.updateCommentById(
        createdComment.id,
        dto,
        undefined,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 403 - if try edit the comment that is not your own', async () => {
      const anotherUser = await authTestManager.getRegisteredAndConfirmedUser();

      const { accessToken: token } = await authTestManager.login({
        loginOrEmail: anotherUser.login,
        password: anotherUser.password,
      });

      const anotherAccessToken: string = token;

      await commentTestManager.updateCommentById(
        createdComment.id,
        dto,
        anotherAccessToken,
        HttpStatus.FORBIDDEN,
      );
    });

    it('status 404 - if comment is not found', async () => {
      await commentTestManager.updateCommentById(
        '000000000000000000000000',
        dto,
        accessToken,
        HttpStatus.NOT_FOUND,
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
    ])(
      'status 400 - if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const invalidDto = commentTestManager.getCommentInputDto(payload);

        const result =
          await commentTestManager.updateCommentById<BadRequestError>(
            createdComment.id,
            invalidDto,
            accessToken,
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
  });

  describe('Tests for DELETE: /api/comments/{commentId} end-point', () => {
    it('status 204 - comment successfully deleted', async () => {
      await commentTestManager.deleteCommentById(
        createdComment.id,
        accessToken,
      );
    });

    it('status 401 - if not authorized', async () => {
      await commentTestManager.deleteCommentById(
        createdComment.id,
        undefined,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 403 - if try delete the comment that is not your own', async () => {
      const anotherUser = await authTestManager.getRegisteredAndConfirmedUser();

      const { accessToken: token } = await authTestManager.login({
        loginOrEmail: anotherUser.login,
        password: anotherUser.password,
      });

      const anotherAccessToken: string = token;

      await commentTestManager.deleteCommentById(
        createdComment.id,
        anotherAccessToken,
        HttpStatus.FORBIDDEN,
      );
    });

    it('status 404 - if comment is not found', async () => {
      await commentTestManager.deleteCommentById(
        '000000000000000000000000',
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('Tests for GET: /api/comments/{id} end-point', () => {
    it('status 200 - returns comment by id', async () => {
      const commentIdResult = await commentTestManager.getCommentById(
        createdComment.id,
      );

      expect(commentIdResult).toEqual({
        id: createdComment.id,
        content: 'Content for comment number 1',
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('status 404 - if comment not found', async () => {
      const notExistingId = '123456789012345678901234';

      await commentTestManager.getCommentById(
        notExistingId,
        undefined,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
