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
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PostsService } from 'src/modules/bloggers-platform/posts/application/services/posts.service';
import { CreatePostDto } from '../dto/input-dto/create-post.input-dto';
import { API_ROUTES } from 'src/core/constants/api-routes';
import { PostsQueryService } from 'src/modules/bloggers-platform/posts/application/services/posts-query.service';
import { PostViewModel } from '../dto/view-dto/post.view-dto';
import {
  Comment,
  CommentModel,
} from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import { IdParamDto } from 'src/core/dto/param.dto';
import { CommentsPaginatedViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comments-paginated.view-dto';
import { PostsPaginatedViewModel } from '../dto/view-dto/posts-paginated.view-dto';
import { PostsQueryDto } from '../dto/input-dto/posts-query.input-dto';
import { UpdatePostDto } from '../dto/input-dto/update-post.input-dto';
import { PostIdParamDto } from '../dto/input-dto/post-id.input-dto';

@Controller(API_ROUTES.posts)
export class PostsController {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModel,
    private postsService: PostsService,
    private readonly postsQueryService: PostsQueryService,
  ) {}

  // * GET: Returns comments for specified post
  @Get(':postId/comments')
  getCommentsForPost(
    @Param() params: PostIdParamDto,
    @Query() queryParams: PostsQueryDto,
  ): Promise<CommentsPaginatedViewModel> {
    return this.postsQueryService.getCommentsForPost(
      params.postId,
      queryParams,
    );
  }

  // * GET: Returns all posts
  @Get()
  getPostsList(
    @Query() queryParams: PostsQueryDto,
  ): Promise<PostsPaginatedViewModel> {
    return this.postsQueryService.getPostsList(queryParams);
  }

  // * POST: Create new post
  @Post()
  async createPost(@Body() dto: CreatePostDto): Promise<PostViewModel> {
    const postDoc = await this.postsService.createPost(dto);

    const postOutput = PostViewModel.mapToViewModel(postDoc);

    return postOutput;
  }

  // * GET: Return post by id
  @Get(':id')
  getPostById(@Param() params: IdParamDto): Promise<PostViewModel | null> {
    return this.postsQueryService.getPostById(params.id);
  }

  // * PUT: Update existing post by id with input model
  @Put(':id')
  @HttpCode(204)
  updatePost(
    @Param() params: IdParamDto,
    @Body() dto: UpdatePostDto,
  ): Promise<void> {
    return this.postsService.updatePost(params.id, dto);
  }

  // * DELETE: Delete post specified by id
  @Delete(':id')
  @HttpCode(204)
  deletePost(@Param() params: IdParamDto): Promise<void> {
    return this.postsService.deletePost(params.id);
  }

  // * tests ================================================================

  @Post(':postId/comments')
  async createComment(
    @Param() params: PostIdParamDto,
    @Body('content') content: string,
  ) {
    const post = await this.postsQueryService.getPostById(params.postId);

    const comment = await this.commentModel.create({
      content,
      postId: new Types.ObjectId(post!.id),
      commentatorInfo: { userId: 'test-user-id', userLogin: 'test-user-login' },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });

    return comment;
  }
}
