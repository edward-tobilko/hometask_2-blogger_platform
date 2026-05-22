import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';

import { BlogTestManager } from 'test/helpers/blogs-test-manager.helper';
import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { BadRequestError } from '../utils/bad-request-error.util';
import { BlogViewModel } from 'src/modules/bloggers-platform/blogs/api/dto/view-dto/blog.view-dto';
import { SortDirections } from 'src/core/enums/sort-directions.enum';
import { BlogsSortBy } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blogs-query.input-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from 'src/modules/bloggers-platform/posts/constraints/posts/posts.constraints';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from 'src/modules/bloggers-platform/blogs/constraints/blogs.constraints';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';
import { PostTestManager } from 'test/helpers/posts-test-manager.helper';

describe('Blogs swagger contract', () => {
  let app: INestApplication;

  let blogTestManager: BlogTestManager;
  let userTestManager: UserTestManager;
  let postTestManager: PostTestManager;

  let httpServer: Server;
  let blogsPath: string;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;

    blogTestManager = result.blogTestManager;
    userTestManager = result.userTestManager;
    postTestManager = result.postTestManager;

    httpServer = app.getHttpServer();
    blogsPath = `/${GLOBAL_PREFIX}/blogs`;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  describe('Tests for GET: /api/blogs end-point', () => {
    it('status 200 - should return blogs list', async () => {
      // * create 12 blogs
      await blogTestManager.createSeveralBlogs(12);

      // * на 1й сторанице -> pageSize=10 (totalCount=12, pagesCount=2)
      const page1 = await blogTestManager.getBlogsPaginatedList({
        query: { pageNumber: 1, pageSize: 10 },
      });

      expect(page1.totalCount).toBe(12);
      expect(page1.pagesCount).toBe(2);
      expect(page1.items).toHaveLength(10);

      // * проверяем структуру первого элемента
      expect(page1.items[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });

      // * на 2й сторанице -> pageSize=2 (totalCount=12, pagesCount=2)
      const page2 = await blogTestManager.getBlogsPaginatedList({
        query: { pageNumber: 2, pageSize: 10 },
      });

      expect(page2.totalCount).toBe(12);
      expect(page2.pagesCount).toBe(2);
      expect(page2.items).toHaveLength(2);
    });

    it('status 200 - should return empty list', async () => {
      const response = await blogTestManager.getBlogsPaginatedList();

      expect(response.totalCount).toBe(0);
      expect(response.items).toHaveLength(0);
    });

    it('status 200 - searching by searchNameTerm', async () => {
      await blogTestManager.createBlog({
        name: 'nest',
        description: 'framework',
        websiteUrl: 'https://nest-framework.com',
      });

      await blogTestManager.createBlog({
        name: 'javascript',
        description: 'language',
        websiteUrl: 'https://js-language.com',
      });

      const response = await blogTestManager.getBlogsPaginatedList({
        query: { searchNameTerm: 'nest' },
      });

      expect(response.totalCount).toBe(1);

      // * проверяем что нашли nest
      expect(response.items[0].name).toBe('nest');

      // * проверяем что javascript не попала
      expect(
        response.items.find((item) => item.name === 'javascript'),
      ).toBeUndefined();
    });

    it('status 200 - sorting blogs by sortDirection and sortBy', async () => {
      await blogTestManager.createSeveralBlogs(3);

      const ascResult = await blogTestManager.getBlogsPaginatedList({
        query: {
          sortDirection: SortDirections.ASC,
          sortBy: BlogsSortBy.CreatedAt,
        },
      });
      const descResult = await blogTestManager.getBlogsPaginatedList({
        query: {
          sortDirection: SortDirections.DESC,
          sortBy: BlogsSortBy.CreatedAt,
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
  });

  describe('Tests for POST: /api/blogs end-point', () => {
    let createdBlog: BlogViewModel;

    beforeEach(async () => {
      const dto = blogTestManager.getBlogInputDto();
      createdBlog = await blogTestManager.createBlog(dto);
    });

    it('status 201 - returns the newly created blog', () => {
      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: createdBlog.name,
        description: createdBlog.description,
        websiteUrl: createdBlog.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });
    });

    it.each([
      {
        name: 'name is a string',
        payload: { name: 2 },
        field: 'name',
      },
      {
        name: 'name length > 15 symbols',
        payload: { name: 'name'.repeat(nameConstraints.maxLength + 1) },
        field: 'name',
      },

      {
        name: 'description is a string',
        payload: { description: 2 },
        field: 'description',
      },
      {
        name: 'description length > 500 symbols',
        payload: {
          description: 'description'.repeat(
            descriptionConstraints.maxLength + 1,
          ),
        },
        field: 'description',
      },

      {
        name: 'website url is too long',
        payload: {
          websiteUrl:
            'https://site.com/' +
            'blogggggggs'.repeat(websiteUrlConstraints.maxLength + 1),
        },
        field: 'websiteUrl',
      },
      {
        name: 'website url is invalid (no https)',
        payload: { websiteUrl: 'http://site.com' },
        field: 'websiteUrl',
      },
      {
        name: 'website url is invalid (random string)',
        payload: { websiteUrl: 'not-a-url' },
        field: 'websiteUrl',
      },
    ] as const)(
      'status 400 - should not create blog if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const dto = blogTestManager.getBlogInputDto(payload);
        const result = (await blogTestManager.createBlog(
          dto,
          HttpStatus.BAD_REQUEST,
        )) as unknown as BadRequestError;

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

    it('status 401 - if no basic auth provided', async () => {
      const dto = blogTestManager.getBlogInputDto();

      await request(httpServer)
        .post(blogsPath)
        .send(dto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for GET: /api/blogs/{blogId}/posts end-point', () => {
    it('status 200 - should return posts list for blog', async () => {
      const blogDto = blogTestManager.getBlogInputDto();
      const createdBlog = await blogTestManager.createBlog(blogDto);

      await blogTestManager.createSeveralPostsForBlog(createdBlog.id, 12);

      const page1 = await blogTestManager.getPostsForBlogPaginatedList(
        createdBlog.id,
        { query: { pageNumber: 1, pageSize: 10 } },
      );

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
      const page2 = await blogTestManager.getPostsForBlogPaginatedList(
        createdBlog.id,
        {
          query: { pageNumber: 2, pageSize: 10 },
        },
      );

      expect(page2.totalCount).toBe(12);
      expect(page2.pagesCount).toBe(2);
      expect(page2.items).toHaveLength(2);
    });

    it('status 200 - should return empty list', async () => {
      const blogDto = blogTestManager.getBlogInputDto();
      const createdBlog = await blogTestManager.createBlog(blogDto);

      const result = await blogTestManager.getPostsForBlogPaginatedList(
        createdBlog.id,
      );

      expect(result.totalCount).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('status 200 - myStatus is "None" for unauthorized user', async () => {
      const blog = await blogTestManager.createBlog(
        blogTestManager.getBlogInputDto(),
      );

      await blogTestManager.createSeveralPostsForBlog(blog.id, 1);

      const result = await blogTestManager.getPostsForBlogPaginatedList(
        blog.id,
      );

      expect(result.items[0].extendedLikesInfo.myStatus).toBe('None');
    });

    it('status 200 - myStatus reflects user like', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      const { accessToken } = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      const blog = await blogTestManager.createBlog(
        blogTestManager.getBlogInputDto(),
      );
      const post = (
        await blogTestManager.createSeveralPostsForBlog(blog.id, 1)
      )[0];

      // * ставим лайк
      await postTestManager.updateLikeStatus(post.id, 'Like', accessToken);

      const result = await blogTestManager.getPostsForBlogPaginatedList(
        blog.id,
        {},
        HttpStatus.OK,
        accessToken,
      );

      expect(result.items[0].extendedLikesInfo.myStatus).toBe('Like');
    });

    it('status 404 - if specificity blog is not exists', async () => {
      const blogDto = blogTestManager.getBlogInputDto();

      await blogTestManager.createBlog(blogDto);

      await blogTestManager.getPostsForBlogPaginatedList(
        '000000000000000000000000',
        undefined,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('Tests for POST: /api/blogs/{blogId}/posts end-point', () => {
    let createdBlog: BlogViewModel;

    beforeEach(async () => {
      const blogDto = blogTestManager.getBlogInputDto();

      createdBlog = await blogTestManager.createBlog(blogDto);
    });

    it('status 201 - should create post for blog', async () => {
      const postDto = blogTestManager.getPostForBlogInputDto();
      const createdPostForBlogRes = await blogTestManager.createPostForBlog(
        createdBlog.id,
        postDto,
      );

      expect(createdPostForBlogRes).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: postDto.title,
          shortDescription: postDto.shortDescription,
          content: postDto.content,
          blogId: createdBlog.id,
          blogName: createdBlog.name,
          createdAt: expect.any(String),

          extendedLikesInfo: expect.objectContaining({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: expect.any(Array),
          }),
        }),
      );
    });

    it('status 404 - if blogId does not exist', async () => {
      const nonExistingBlogId = '507f1f77bcf86cd799439011';

      const postDto = blogTestManager.getPostForBlogInputDto();

      await blogTestManager.createPostForBlog(
        nonExistingBlogId,
        postDto,
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
    ] as const)(
      'status 400 - should not create post if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const postDto = blogTestManager.getPostForBlogInputDto(payload);
        const createdPostForBlogResult =
          (await blogTestManager.createPostForBlog(
            createdBlog.id,
            postDto,
            HttpStatus.BAD_REQUEST,
          )) as unknown as BadRequestError;

        expect(createdPostForBlogResult.errorsMessages).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              field,
            }),
          ]),
        );
      },
    );

    it('status 401 - if no basic auth provided', async () => {
      const postDto = blogTestManager.getPostForBlogInputDto();

      await request(httpServer)
        .post(`${blogsPath}/${createdBlog.id}/posts`)
        .send(postDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for GET: /api/blogs/{id} end-point', () => {
    it('status 200 - should return one blog by id', async () => {
      const dto = blogTestManager.getBlogInputDto();
      const result = await blogTestManager.createBlog(dto);

      const blogIdRes = await blogTestManager.getBlogById(result.id);

      expect(blogIdRes).toEqual(result);
    });

    it('status 404 - if blog not found', async () => {
      const dto = blogTestManager.getBlogInputDto();

      await blogTestManager.createBlog(dto);

      await blogTestManager.getBlogById(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('Tests for PUT: /api/blogs/{id} end-point', () => {
    it('status 204 - should update blog by id', async () => {
      const dto = blogTestManager.getBlogInputDto();
      const createdBlogResult = await blogTestManager.createBlog(dto);

      const updatedDtoBlog = {
        ...dto,
        name: 'react',
      };

      await blogTestManager.updateBlog(createdBlogResult.id, updatedDtoBlog);

      const updatedBlogResponse = await blogTestManager.getBlogById(
        createdBlogResult.id,
      );

      expect(updatedBlogResponse).toEqual({
        ...updatedDtoBlog,
        id: createdBlogResult.id,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('status 404 - if blog not found', async () => {
      const dto = blogTestManager.getBlogInputDto();

      await blogTestManager.createBlog(dto);

      await blogTestManager.updateBlog(
        '000000000000000000000000',
        dto,
        HttpStatus.NOT_FOUND,
      );
    });

    it.each([
      {
        name: 'name is a string',
        payload: { name: 2 },
        field: 'name',
      },
      {
        name: 'name length > 15 symbols',
        payload: { name: 'name'.repeat(nameConstraints.maxLength + 1) },
        field: 'name',
      },

      {
        name: 'description is a string',
        payload: { description: 2 },
        field: 'description',
      },
      {
        name: 'description length > 500 symbols',
        payload: {
          description: 'description'.repeat(
            descriptionConstraints.maxLength + 1,
          ),
        },
        field: 'description',
      },

      {
        name: 'website url is too long',
        payload: {
          websiteUrl:
            'https://site.com/' +
            'blogggggggs'.repeat(websiteUrlConstraints.maxLength + 1),
        },
        field: 'websiteUrl',
      },
      {
        name: 'website url is invalid (no https)',
        payload: { websiteUrl: 'http://site.com' },
        field: 'websiteUrl',
      },
      {
        name: 'website url is invalid (random string)',
        payload: { websiteUrl: 'not-a-url' },
        field: 'websiteUrl',
      },
    ] as const)(
      'status 400 - should not create blog if the inputModel has incorrect values',
      async ({ payload, field }) => {
        const validDto = blogTestManager.getBlogInputDto();
        const createdBlog = await blogTestManager.createBlog(validDto);

        const invalidDto = blogTestManager.getBlogInputDto(payload);

        const result = (await blogTestManager.updateBlog(
          createdBlog.id,
          invalidDto,
          HttpStatus.BAD_REQUEST,
        )) as unknown as BadRequestError;

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

    it('status 401 - if no basic auth provided', async () => {
      const dto = blogTestManager.getBlogInputDto();
      const createdBlogResult = await blogTestManager.createBlog(dto);

      await request(httpServer)
        .put(`${blogsPath}/${createdBlogResult.id}`)
        .send(blogTestManager.getBlogInputDto())
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Tests for DELETE: /api/blogs/{id} end-point', () => {
    it('status 204 - should remove blog by id and check after NOT FOUND', async () => {
      const dto = blogTestManager.getBlogInputDto();
      const result = await blogTestManager.createBlog(dto);

      await blogTestManager.deleteBlog(result.id);

      await blogTestManager.getBlogById(result.id, HttpStatus.NOT_FOUND);
    });

    it('status 404 - if blog not found', async () => {
      const dto = blogTestManager.getBlogInputDto();

      await blogTestManager.createBlog(dto);

      await blogTestManager.deleteBlog(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });

    it('status 401 - if no basic auth provided', async () => {
      const dto = blogTestManager.getBlogInputDto();

      const blog = await blogTestManager.createBlog(dto);

      await request(httpServer)
        .delete(`${blogsPath}/${blog.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
