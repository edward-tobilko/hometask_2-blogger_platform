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
import { ApiTags } from '@nestjs/swagger';

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
import { GetBlogByIdQuery } from '../../application/queries/get-blog.query';
import { GetPostsForBlogQuery } from '../../application/queries/get-posts-for-blog.query';
import { CreateBlogCommand } from '../../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from 'src/modules/bloggers-platform/posts/application/use-cases/create-post.use-case';
import { ApiGetBlogsSwagger } from '../decorators/swagger/get-blogs-list-swagger.decorator';
import { ApiCreateBlogSwagger } from '../decorators/swagger/create-blog-swagger.decorator';
import { ApiGetPostsForBlogSwagger } from '../decorators/swagger/get-posts-for-blog-swagger.decorator';
import { CreatePostForBlogSwagger } from '../decorators/swagger/create-post-for-blog-swagger.decorator';
import { ApiGetBlogByIdSwagger } from '../decorators/swagger/get-blog-swagger.decorator';
import { ApiUpdateBlogSwagger } from '../decorators/swagger/update-blog-swagger.decorator';
import { ApiDeleteBlogSwagger } from '../decorators/swagger/delete-blog-swagger.decorator';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { CurrentUserOptionalFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';

@ApiTags('Blogs')
@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @ApiGetBlogsSwagger('Returns blogs with paging')
  @Get()
  async getBlogsList(
    @Query() query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.queryBus.execute(new GetBlogsListQuery(query));
  }

  @ApiCreateBlogSwagger('Create new blog')
  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body()
    createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    const command = new CreateBlogCommand(createBlogDto);
    const createdBlogDoc = await this.commandBus.execute(command);

    return BlogViewModel.mapToViewModel(createdBlogDoc);
  }

  @ApiGetPostsForBlogSwagger('Returns all posts for specified blog')
  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsListForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Query() query: PostsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PostsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetPostsForBlogQuery(params.blogId, query, user?.id),
    );
  }

  @CreatePostForBlogSwagger('Create new post for specific blog')
  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param() params: BlogIdForPostsParamDto,
    @Body()
    dto: CreatePostForBlogDto,
  ): Promise<PostViewModel> {
    const command = new CreatePostCommand({ ...dto, blogId: params.blogId }); // делегируем создания поста с энд-поинта "posts"
    const post = await this.commandBus.execute(command);
    const postOutput = PostViewModel.mapToViewModel(post);

    return postOutput;
  }

  @ApiGetBlogByIdSwagger('Returns blog by id')
  @Get(':id') // = /blogs:id
  async getBlog(@Param() params: BlogIdParamDto): Promise<BlogViewModel> {
    return await this.queryBus.execute(new GetBlogByIdQuery(params.id));
  }

  @ApiUpdateBlogSwagger('Update existing blog by id with input model')
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

  @ApiDeleteBlogSwagger('Delete blog specified by id')
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param() params: BlogIdParamDto): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(params.id));
  }
}
