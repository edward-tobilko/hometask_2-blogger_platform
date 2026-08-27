import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
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
import { CurrentUserOptionalFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';

@ApiTags('Blogs')
@SkipThrottle()
@Controller(API_ROUTES.blogs)
export class BlogsController {
  constructor(private queryBus: QueryBus) {}

  @ApiGetBlogsSwagger('Returns blogs with paging')
  @Get()
  async getBlogsList(
    @Query() query: BlogsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.queryBus.execute(new GetBlogsListQuery(query, user?.id));
  }

  @ApiGetPostsForBlogSwagger('Returns all posts for specified blog')
  @Get(':blogId/posts')
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
  async getBlog(
    @Param('id', UuidValidationPipe) id: string,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<BlogViewModel> {
    return await this.queryBus.execute(new GetBlogByIdQuery(id, user?.id));
  }
}
