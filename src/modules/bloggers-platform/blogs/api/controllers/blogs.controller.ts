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
import { CommandBus, QueryBus } from '@nestjs/cqrs';

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
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { GetBlogsListQuery } from '../../application/queries/get-blogs-list.query';
import { GetBlogByIdQuery } from '../../application/queries/get-blog.use-case';
import { GetPostsForBlogQuery } from '../../application/queries/get-posts-for-blog.query';
import { CreateBlogCommand } from '../../application/use-cases/create-blog.use-case';
import { BlogDocument } from '../../domain/entities/blog.entity';
import { UpdateBlogCommand } from '../../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from 'src/modules/bloggers-platform/posts/application/use-cases/create-post.use-case';
import { PostDocument } from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';

@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  // * GET: Returns blogs with paging
  @Get()
  async getBlogsList(
    @Query() query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.queryBus.execute(new GetBlogsListQuery(query));
  }

  // * POST: Create new blog
  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body()
    createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    const createdBlogDoc = await this.commandBus.execute<
      CreateBlogCommand,
      BlogDocument
    >(new CreateBlogCommand(createBlogDto));

    return BlogViewModel.mapToViewModel(createdBlogDoc);
  }

  // * GET: Returns all posts for specified blog
  @Get(':blogId/posts')
  async getPostsListForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Query() query: PostsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetPostsForBlogQuery(params.blogId, query),
    );
  }

  // * POST: Create new post for specific blog
  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Body()
    dto: CreatePostForBlogDto,
  ): Promise<PostViewModel> {
    const post = await this.commandBus.execute<CreatePostCommand, PostDocument>(
      new CreatePostCommand({ ...dto, blogId: params.blogId }), // делегируем создания поста с энд-поинта "posts"
    );

    const postOutput = PostViewModel.mapToViewModel(post);

    return postOutput;
  }

  // * GET: Returns blog by id
  @Get(':id') // = /blogs:id
  async getBlog(@Param() params: BlogIdParamDto): Promise<BlogViewModel> {
    return await this.queryBus.execute(new GetBlogByIdQuery(params.id));
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
    await this.commandBus.execute(
      new UpdateBlogCommand(params.id, updateBlogDto),
    );
  }

  // * DELETE: Delete blog specified by id
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param() params: BlogIdParamDto): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(params.id));
  }
}
