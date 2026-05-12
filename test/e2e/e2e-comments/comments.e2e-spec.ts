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

describe('Comments swagger contract', () => {
  let app: INestApplication;

  let commentTestManager: CommentTestManager;
  let postTestManager: PostTestManager;
  let blogTestManager: BlogTestManager;
  let authTestManager: UserTestManager;

  let createdBlog: BlogViewModel;

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
  });

  describe('Tests for GET: /api/comments/{id} end-point', () => {
    let createdComment: CommentViewModel;
    let createdPost: PostViewModel;

    let accessToken: string;

    beforeEach(async () => {
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

    it('status 200 - returns comment by id', async () => {
      const commentIdResult = await commentTestManager.getCommentById(
        createdComment.id,
      );

      expect(commentIdResult).toEqual(createdComment);
    });

    it('status 404 - if comment not found', async () => {
      const notExistingId = '123456789012345678901234';

      await commentTestManager.getCommentById(
        notExistingId,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
