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

import { PostsService } from 'src/modules/bloggers-platform/posts/application/services/posts.service';
import { CreatePostDto } from '../dto/input-dto/create-post.input-dto';
import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { PostViewModel } from '../dto/view-dto/post.view-dto';
import { IdParamDto } from 'src/core/dto/param.dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { PostsPaginatedViewModel } from '../dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from '../dto/input-dto/posts-query.input-dto';
import { UpdatePostDto } from '../dto/input-dto/update-post.input-dto';
import { PostIdParamDto } from '../dto/input-dto/post-id.input-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { CreateCommentInputDto } from '../dto/input-dto/create-comment.input-dto';
import { GetPostByIdQuery } from '../../application/queries/get-post-by-id.query';
import { GetPostsListQuery } from '../../application/queries/get-posts-list.query';
import { GetCommentByPostIdQuery } from '../../application/queries/get-comment-by-postid.query';
import { CreateCommentCommand } from '../../application/use-cases/create-comment.use-case';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CurrentUserFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';

@Controller(API_ROUTES.posts)
export class PostsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
    private postsService: PostsService,
  ) {}

  // * GET: Returns comments for specified post
  @Get(':postId/comments')
  getCommentsForPost(
    @Param() params: PostIdParamDto,
    @Query() queryParams: PostsQueryDto,
  ): Promise<CommentsPaginatedViewModel> {
    return this.queryBus.execute(
      new GetCommentByPostIdQuery(params.postId, queryParams),
    );
  }

  // * POST: Create new comment.
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param() params: PostIdParamDto,
    @Body() dto: CreateCommentInputDto,
    @CurrentUserFromRequest() currentUser: { id: string },
  ) {
    return this.commandBus.execute(
      new CreateCommentCommand(params.postId, dto.content, currentUser.id),
    );
  }

  // * GET: Returns all posts
  @Get()
  getPostsList(
    @Query() queryParams: PostsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    return this.queryBus.execute(new GetPostsListQuery(queryParams));
  }

  // * POST: Create new post
  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() dto: CreatePostDto): Promise<PostViewModel> {
    const postDoc = await this.postsService.createPost(dto);

    const postOutput = PostViewModel.mapToViewModel(postDoc);

    return postOutput;
  }

  // * GET: Return post by id
  @Get(':id')
  getPostById(@Param() params: IdParamDto): Promise<PostViewModel | null> {
    return this.queryBus.execute(new GetPostByIdQuery(params.id));
  }

  // * PUT: Update existing post by id with input model
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  updatePost(
    @Param() params: IdParamDto,
    @Body() dto: UpdatePostDto,
  ): Promise<void> {
    return this.postsService.updatePost(params.id, dto);
  }

  // * DELETE: Delete post specified by id
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  deletePost(@Param() params: IdParamDto): Promise<void> {
    return this.postsService.deletePost(params.id);
  }
}
