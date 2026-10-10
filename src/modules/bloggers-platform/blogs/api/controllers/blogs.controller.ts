import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { BlogViewModel } from '../dto/view-dto/blog.view-dto';
import { BlogsQueryDto } from '../dto/input-dto/blogs-query.input-dto';
import { PaginatedViewDto } from 'src/core/dto/paginated-view.dto';
import { PostsPaginatedViewModel } from 'src/modules/bloggers-platform/posts/api/dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from 'src/modules/bloggers-platform/posts/api/dto/input-dto/posts-query.input-dto';
import { GetBlogsListQuery } from '../../application/queries/get-blogs-list.query';
import { GetBlogByIdQuery } from '../../application/queries/get-blog.query';
import { GetPostsForBlogQuery } from '../../application/queries/get-posts-for-blog.query';
import { ApiGetBlogsSwagger } from '../decorators/swagger/get-blogs-list-swagger.decorator';
import { ApiGetPostsForBlogSwagger } from '../decorators/swagger/get-posts-for-blog-swagger.decorator';
import { ApiGetBlogByIdSwagger } from '../decorators/swagger/get-blog-swagger.decorator';
import {
  CurrentUserFromRequest,
  CurrentUserOptionalFromRequest,
} from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';
import { BlogPostsCountViewModel } from '../dto/view-dto/blog-posts-count.view-dto';
import { GetPostsCountForBlogQuery } from '../../application/queries/get-posts-count-for-blog.query';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { SubscribeToBlogCommand } from '../../application/use-cases/subscribe-to-blog.use-case';
import { UnsubscribeFromBlogCommand } from '../../application/use-cases/unsubscribe-from-blog.use-case';
import { GetBlogSubscribersCountQuery } from '../../application/queries/get-blog-subscribers-count.query';

@ApiTags('Blogs')
@SkipThrottle()
@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @ApiGetBlogsSwagger('Returns blogs with paging')
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getBlogsList(
    @Query() query: BlogsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.queryBus.execute(new GetBlogsListQuery(query, user?.id));
  }

  @ApiGetPostsForBlogSwagger('Returns all posts for specified blog')
  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsListForBlog(
    @Param('blogId', UuidValidationPipe) blogId: string,
    @Query() queryDto: PostsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PostsPaginatedViewModel> {
    const query = new GetPostsForBlogQuery(blogId, queryDto, user?.id);

    return this.queryBus.execute(query);
  }

  @ApiGetBlogByIdSwagger('Returns blog by id')
  @Get(':id') // = /blogs:id
  @UseGuards(JwtOptionalAuthGuard)
  async getBlog(
    @Param('id', UuidValidationPipe) id: string,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<BlogViewModel> {
    return await this.queryBus.execute(new GetBlogByIdQuery(id, user?.id));
  }

  // * Fetch posts count of blog (EXTRA END-POINT)
  @Get(':blogId/posts/count')
  async getPostsCountForBlog(
    @Param('blogId', UuidValidationPipe) blogId: string,
  ): Promise<BlogPostsCountViewModel> {
    const count = await this.queryBus.execute(
      new GetPostsCountForBlogQuery(blogId),
    );

    return BlogPostsCountViewModel.mapToViewModel(count);
  }

  // * Create subscription (EXTRA END-POINT)
  @Post(':blogId/subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async subscribe(
    @Param('blogId', UuidValidationPipe) blogId: string,
    @CurrentUserFromRequest() user: { id: string },
  ) {
    const command = new SubscribeToBlogCommand(user.id, blogId);

    await this.commandBus.execute(command);
  }

  // * Remove subscription (EXTRA END-POINT)
  @Delete(':blogId/subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async unsubscribe(
    @Param('blogId', UuidValidationPipe) blogId: string,
    @CurrentUserFromRequest() user: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new UnsubscribeFromBlogCommand(blogId, user.id),
    );
  }

  // * Fetch blog subscribers count (EXTRA END-POINT)
  @Get(':blogId/subscribers/count')
  async getSubscribersCount(
    @Param('blogId', UuidValidationPipe) blogId: string,
  ): Promise<{ subscribersCount: number }> {
    const count = await this.queryBus.execute(
      new GetBlogSubscribersCountQuery(blogId),
    );

    return count;
  }
}
