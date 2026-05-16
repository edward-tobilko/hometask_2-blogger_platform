import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateBlogDto } from '../dto/input-dto/create-blog.input-dto';
import { BlogViewModel } from '../dto/view-dto/blog.view-dto';
import { CreatePostForBlogDto } from '../dto/input-dto/create-post-for-blog.input-dto';
import {
  BlogIdForPostsParamDto,
  BlogIdParamDto,
} from '../dto/input-dto/blog-params.input-dto';
import { UpdateBlogDto } from '../dto/input-dto/update-blog.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { BlogsQueryDto } from '../dto/input-dto/blogs-query.input-dto';
import { BlogsService } from 'src/modules/bloggers-platform/blogs/application/services/blogs.service';
import { BlogsQueryService } from 'src/modules/bloggers-platform/blogs/application/services/blogs.query-service';
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';

@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(
    private readonly blogsQueryService: BlogsQueryService,
    private blogsService: BlogsService,
  ) {}

  // * GET: Returns blogs with paging
  @Get() // = /blogs: декоратор (@) метода Get, автоматом возвр. status 200
  async getBlogsList(
    @Query() query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.blogsQueryService.getBlogsList(query);
  }

  // * POST: Create new blog
  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body()
    createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    const createdBlogDoc = await this.blogsService.createBlog(createBlogDto);

    return BlogViewModel.mapToViewModel(createdBlogDoc);
  }

  // * GET: Returns all posts for specified blog
  @Get(':blogId/posts')
  async getPostsListForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Query() query: PostsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    return this.blogsQueryService.getPostsForBlog(params.blogId, query);
  }

  // * POST: Create new post for specific blog
  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Body()
    dto: CreatePostForBlogDto,
  ): Promise<PostViewModel> {
    const post = await this.blogsService.createPostForBlog(params.blogId, dto);

    const postOutput = PostViewModel.mapToViewModel(post);

    return postOutput;
  }

  // * GET: Returns blog by id
  @Get(':id') // = /blogs:id
  async getBlog(@Param() params: BlogIdParamDto): Promise<BlogViewModel> {
    const blogOutput = await this.blogsQueryService.getBlogById(params.id);

    if (!blogOutput)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This blog with ID:${params.id} was not found`,
      });

    return blogOutput;
  }

  // * PUT: Update existing blog by id with input model
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlog(
    @Param() params: BlogIdParamDto,
    @Body()
    updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(params.id, updateBlogDto);
  }

  // * DELETE: Delete blog specified by id
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param() params: BlogIdParamDto): Promise<void> {
    await this.blogsService.deleteBlog(params.id);
  }
}
