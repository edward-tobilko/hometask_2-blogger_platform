import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogViewModel } from '../dto/view/blog.view';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';
import { BlogIdForPostsParamDto, BlogIdParamDto } from '../dto/blog-params.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view/post.view';
import { BlogsQueryDto } from '../dto/blogs-query.dto';
import { BlogsService } from 'src/modules/bloggers-platform/blogs/application/services/blogs.service';
import { BlogsQueryService } from 'src/modules/bloggers-platform/blogs/application/services/blogs.query-service';

@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(
    private readonly blogsQueryService: BlogsQueryService,
    private blogsService: BlogsService,
  ) {}

  // * GET: Returns blogs with paging
  @Get() // = /blogs: декоратор (@) метода Get, автоматом возвр. status 200
  async getBlogsList(@Query() query: BlogsQueryDto) {
    return await this.blogsQueryService.getBlogsList(query);
  }

  // * POST: Create new blog
  @Post()
  async createBlog(
    @Body()
    createBlogDto: CreateBlogDto,
  ) {
    const createdBlogDoc = await this.blogsService.createBlog(createBlogDto);

    return BlogViewModel.mapToViewModel(createdBlogDoc);
  }

  // * GET: Returns all posts for specified blog
  @Get(':blogId/posts')
  async getPostsListForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Query() query: BlogsQueryDto,
  ) {
    return await this.blogsQueryService.getPostsForBlog(params.blogId, query);
  }

  // * POST: Create new post for specific blog
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Body()
    dto: CreatePostForBlogDto,
  ) {
    const post = await this.blogsService.createPostForBlog(params.blogId, dto);

    const postOutput = PostViewModel.mapToViewModel(post);

    return postOutput;
  }

  // * GET: Returns blog by id
  @Get(':id') // = /blogs:id
  async getBlog(@Param() params: BlogIdParamDto) {
    const blogOutput = await this.blogsQueryService.getBlogById(params.id);

    if (!blogOutput)
      throw new NotFoundException(
        `The blog with ID:${params.id} was not found`,
      );

    return blogOutput;
  }

  // * PUT: Update existing blog by id with input model
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param() params: BlogIdParamDto,
    @Body()
    updateBlogDto: UpdateBlogDto,
  ) {
    await this.blogsService.updateBlog(params.id, updateBlogDto);
  }

  // * DELETE: Delete blog specified by id
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param() params: BlogIdParamDto) {
    await this.blogsService.deleteBlog(params.id);
  }
}
