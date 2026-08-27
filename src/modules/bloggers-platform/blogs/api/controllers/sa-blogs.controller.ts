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
import { BlogIdForPostsParamDto } from '../dto/input-dto/blog-params.input-dto';
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
// import { GetPostsCountForBlogQuery } from '../../application/queries/get-posts-count-for-blog.query';
// import { BlogPostsCountViewModel } from '../dto/view-dto/blog-posts-count.view-dto';
// import { SubscribeToBlogCommand } from '../../application/use-cases/subscribe-to-blog.use-case';
// import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
// import { UnsubscribeFromBlogCommand } from '../../application/use-cases/unsubscribe-from-blog.use-case';
// import { GetBlogSubscribersCountQuery } from '../../application/queries/get-blog-subscribers-count.query';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';

@ApiTags('Blogs')
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
    createBlogDto: CreateBlogDto,
  ): Promise<BlogViewModel> {
    const command = new CreateBlogCommand(createBlogDto);

    return this.commandBus.execute(command);
  }

  @ApiUpdateBlogSwagger('Update existing blog by id with input model')
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id', UuidValidationPipe) id: string,
    @Body()
    updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, updateBlogDto));
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
    @Param() params: BlogIdForPostsParamDto,
    @Query() query: PostsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PostsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetPostsForBlogQuery(params.blogId, query, user?.id),
    );
  }

  // * Extra end-points
  // @Get(':blogId/posts/count')
  // async getPostsCountForBlog(
  //   @Param() params: BlogIdForPostsParamDto,
  // ): Promise<BlogPostsCountViewModel> {
  //   return this.queryBus.execute(new GetPostsCountForBlogQuery(params.blogId));
  // }

  // @Post(':blogId/subscribe')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(204)
  // async subscribe(
  //   @Param() params: BlogIdForPostsParamDto,
  //   @CurrentUserFromRequest() user: { id: string },
  // ) {
  //   const command = new SubscribeToBlogCommand(user.id, params.blogId);

  //   await this.commandBus.execute(command);
  // }

  // @Delete(':blogId/subscribe')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(204)
  // async unsubscribe(
  //   @Param() params: BlogIdForPostsParamDto,
  //   @CurrentUserFromRequest() user: { id: string },
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new UnsubscribeFromBlogCommand(params.blogId, user.id),
  //   );
  // }

  // @Get(':blogId/subscribers/count')
  // async getSubscribersCount(
  //   @Param() params: BlogIdForPostsParamDto,
  // ): Promise<{ subscribersCount: number }> {
  //   const count = await this.queryBus.execute(
  //     new GetBlogSubscribersCountQuery(params.blogId),
  //   );

  //   return count;
  // }
}
