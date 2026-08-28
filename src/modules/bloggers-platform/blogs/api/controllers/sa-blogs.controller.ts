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
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateBlogDto } from '../dto/input-dto/create-blog.input-dto';
import { BlogViewModel } from '../dto/view-dto/blog.view-dto';
import { CreatePostForBlogDto } from '../dto/input-dto/create-post-for-blog.input-dto';
import { UpdateBlogDto } from '../dto/input-dto/update-blog.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/post.view-dto';
import { BlogsQueryDto } from '../dto/input-dto/blogs-query.input-dto';
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { GetBlogsListQuery } from '../../application/queries/get-blogs-list.query';
import { GetPostsForBlogQuery } from '../../application/queries/get-posts-for-blog.query';
import { CreateBlogCommand } from '../../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../../application/use-cases/delete-blog.use-case';
import { CreatePostCommand } from 'src/modules/bloggers-platform/posts/application/use-cases/create-post.use-case';
import { ApiGetBlogsSwagger } from '../decorators/swagger/get-blogs-list-swagger.decorator';
import { ApiCreateBlogSwagger } from '../decorators/swagger/create-blog-swagger.decorator';
import { ApiGetPostsForBlogSwagger } from '../decorators/swagger/get-posts-for-blog-swagger.decorator';
import { CreatePostForBlogSwagger } from '../decorators/swagger/create-post-for-blog-swagger.decorator';
import { ApiUpdateBlogSwagger } from '../decorators/swagger/update-blog-swagger.decorator';
import { ApiDeleteBlogSwagger } from '../decorators/swagger/delete-blog-swagger.decorator';
import { CurrentUserOptionalFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';
import { UpdatePostByIdCommand } from 'src/modules/bloggers-platform/posts/application/use-cases/update-post.use-case';
import { ApiUpdatePostForBlogSwagger } from '../decorators/swagger/update-post-for-blog-swagger.decorator';
import { ApiDeletePostForBlogSwagger } from '../decorators/swagger/delete-post-for-blog-swagger.decorator';
import { DeletePostByIdCommand } from 'src/modules/bloggers-platform/posts/application/use-cases/delete-post.use-case';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';

@ApiTags('SuperAdminBlogs')
@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller(API_ROUTES.saBlogs)
export class SaBlogsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @ApiGetBlogsSwagger('Returns blogs with paging')
  @Get()
  async getBlogsList(
    @Query() query: BlogsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.queryBus.execute(new GetBlogsListQuery(query, user?.id));
  }

  @ApiCreateBlogSwagger('Create new blog')
  @Post()
  async createBlog(
    @Body()
    dto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    // ! Вопросс ментору: нужно ли мапить данные с dto в command для domain ???
    const command = new CreateBlogCommand({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });

    const blogInstance = await this.commandBus.execute(command);

    return BlogViewModel.mapToViewModel(
      blogInstance,
      0,
      SubscriptionStatus.None,
    );
  }

  @ApiUpdateBlogSwagger('Update existing blog by id with input model')
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id', UuidValidationPipe) id: string,
    @Body()
    dto: UpdateBlogDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateBlogCommand(id, {
        name: dto.name,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
      }),
    );
  }

  @ApiDeleteBlogSwagger('Delete blog specified by id')
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id', UuidValidationPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @CreatePostForBlogSwagger('Create new post for specific blog')
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId', UuidValidationPipe) blogId: string,
    @Body()
    dto: CreatePostForBlogDto,
  ): Promise<PostViewModel> {
    const command = new CreatePostCommand({ ...dto, blogId }); // делегируем создания поста с энд-поинта "posts"
    const post = await this.commandBus.execute(command);
    const postOutput = PostViewModel.mapToViewModel(post);

    return postOutput;
  }

  @ApiGetPostsForBlogSwagger('Returns all posts for specified blog')
  @Get(':blogId/posts')
  async getPostsListForBlog(
    @Param('blogId', UuidValidationPipe) blogId: string,
    @Query() query: PostsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PostsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetPostsForBlogQuery(blogId, query, user?.id),
    );
  }

  @ApiUpdatePostForBlogSwagger('Update existing post by id with input model')
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  updatePost(
    @Param('blogId', UuidValidationPipe) blogId: string,
    @Param('postId', UuidValidationPipe) postId: string,
    @Body() dto: CreatePostForBlogDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostByIdCommand(blogId, postId, {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
      }),
    );
  }

  @ApiDeletePostForBlogSwagger('Delete post specified by id')
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  deletePost(
    @Param('postId', UuidValidationPipe) postId: string,
    @Param('blogId', UuidValidationPipe) blogId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeletePostByIdCommand(postId, blogId));
  }
}
