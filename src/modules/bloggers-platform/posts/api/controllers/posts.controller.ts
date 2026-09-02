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

import { CreatePostDto } from '../dto/input-dto/create-post.input-dto';
import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { PostViewModel } from '../dto/view-dto/post.view-dto';
import { IdParamDto } from 'src/core/dto/param.dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { PostsPaginatedViewModel } from '../dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from '../dto/input-dto/posts-query.input-dto';
import { UpdatePostDto } from '../dto/input-dto/update-post.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { CreateCommentInputDto } from '../dto/input-dto/create-comment.input-dto';
import { GetPostByIdQuery } from '../../application/queries/get-post-by-id.query';
import { GetPostsListQuery } from '../../application/queries/get-posts-list.query';
import { CreateCommentCommand } from '../../application/use-cases/create-comment.use-case';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import {
  CurrentUserFromRequest,
  CurrentUserOptionalFromRequest,
} from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';
import { CreatePostCommand } from '../../application/use-cases/create-post.use-case';
import { UpdatePostByIdCommand } from '../../application/use-cases/update-post.use-case';
import { DeletePostByIdCommand } from '../../application/use-cases/delete-post.use-case';
// import { UpdatePostLikeStatusCommand } from '../../application/use-cases/update-post-like-status.use-case';
// import { LikeStatusDto } from 'src/core/dto/like-status.dto';
import { ApiGetPostsSwagger } from '../decorators/swagger/get-posts-swagger.decorator';
import { ApiGetPostByIdSwagger } from '../decorators/swagger/get-post-swagger.decorator';
import { ApiCreatePostSwagger } from '../decorators/swagger/create-post-swagger.decorator';
import { ApiUpdatePostSwagger } from '../decorators/swagger/update-post-swagger.decorator';
import { ApiDeletePostSwagger } from '../decorators/swagger/delete-post-swagger.decorator';
import { ApiGetCommentsForPostSwagger } from '../decorators/swagger/get-comments-for-post-swagger.decorator';
import { ApiCreateCommentFroPostSwagger } from '../decorators/swagger/create-comment-for-post-swagger.decorator';
// import { ApiUpdateLikeStatusForPostSwagger } from '../decorators/swagger/update-like-status-for-post-swagger.decorator';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { GetCommentByPostIdQuery } from '../../application/queries/get-comment-by-post-id.query';

@ApiTags('Posts')
@SkipThrottle()
@Controller(API_ROUTES.posts)
export class PostsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  // @ApiUpdateLikeStatusForPostSwagger(
  //   'Make like / unlike / dislike / undislike operation',
  // )
  // @Put(':postId/like-status')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(204)
  // updatePostLikeStatus(
  //   @Param() params: PostIdParamDto,
  //   @Body() dto: LikeStatusDto,
  //   @CurrentUserFromRequest() currentUser: { id: string },
  // ): Promise<void> {
  //   return this.commandBus.execute(
  //     new UpdatePostLikeStatusCommand(
  //       params.postId,
  //       currentUser.id,
  //       dto.likeStatus,
  //     ),
  //   );
  // }

  @ApiGetCommentsForPostSwagger('Returns comments for specified post')
  @Get(':postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  getCommentsForPost(
    @Param('postId', UuidValidationPipe) postId: string,
    @Query() queryParams: PostsQueryDto,
    @CurrentUserOptionalFromRequest() user: { id: string } | null,
  ): Promise<CommentsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetCommentByPostIdQuery(postId, queryParams, user?.id),
    );
  }

  @ApiCreateCommentFroPostSwagger('Create new comment')
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('postId', UuidValidationPipe) postId: string,
    @Body() dto: CreateCommentInputDto,
    @CurrentUserFromRequest() currentUser: { id: string },
  ) {
    const command = new CreateCommentCommand(
      postId,
      dto.content,
      currentUser.id,
    );
    const commentInstance = await this.commandBus.execute(command);

    return CommentViewModel.mapToViewModel(commentInstance);
  }

  @ApiGetPostsSwagger('Returns all posts')
  @Get()
  getPostsList(
    @Query() queryParams: PostsQueryDto,
    @CurrentUserOptionalFromRequest() currentUser: { id: string } | null,
  ): Promise<PostsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetPostsListQuery(queryParams, currentUser?.id),
    );
  }

  @ApiCreatePostSwagger('Create new post')
  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() dto: CreatePostDto): Promise<PostViewModel> {
    const command = new CreatePostCommand(dto);
    const postDoc = await this.commandBus.execute(command);

    return PostViewModel.mapToViewModel(postDoc);
  }

  @ApiGetPostByIdSwagger('Return post by id')
  @Get(':id')
  getPostById(
    @Param('id', UuidValidationPipe) id: string,
    @CurrentUserOptionalFromRequest() currentUser: { id: string } | null,
  ): Promise<PostViewModel | null> {
    return this.queryBus.execute(new GetPostByIdQuery(id, currentUser?.id));
  }

  @ApiUpdatePostSwagger('Update existing post by id with input model')
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  updatePost(
    @Param() params: IdParamDto,
    @Body() dto: UpdatePostDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdatePostByIdCommand>(
      new UpdatePostByIdCommand(dto.blogId, params.id, dto),
    );
  }

  @ApiDeletePostSwagger('Delete post specified by id')
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  deletePost(@Param() params: IdParamDto): Promise<void> {
    return this.commandBus.execute(new DeletePostByIdCommand(params.id));
  }
}
