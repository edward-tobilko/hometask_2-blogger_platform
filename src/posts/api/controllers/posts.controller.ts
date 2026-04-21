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

import { PostsService } from 'src/posts/application/services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { API_ROUTES } from 'src/core/constants/api-routes';
import { PostIdParamDto } from '../dto/post-params.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsQueryService } from 'src/posts/application/services/posts-query.service';
import { PostsQueryDto } from '../dto/posts-query.dto';
import { PostViewModel } from '../dto/view/post.view';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentModel,
} from 'src/comments/domain/entities/comment.entity';
import { IdParamDto } from 'src/core/dtos/param.dto';
import { Types } from 'mongoose';

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
  ) {
    return this.postsQueryService.getCommentsForPost(
      params.postId,
      queryParams,
    );
  }

  // * GET: Returns all posts
  @Get()
  getPostsList(@Query() queryParams: PostsQueryDto) {
    return this.postsQueryService.getPostsList(queryParams);
  }

  // * POST: Create new post
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    const postDoc = await this.postsService.createPost(dto);

    const postOutput = PostViewModel.mapToViewModel(postDoc);

    return postOutput;
  }

  // * GET: Return post by id
  @Get(':id')
  getPostById(@Param() params: IdParamDto) {
    return this.postsQueryService.getPostById(params.id);
  }

  // * PUT: Update existing post by id with input model
  @Put(':id')
  @HttpCode(204)
  updatePost(@Param() params: IdParamDto, @Body() dto: UpdatePostDto) {
    return this.postsService.updatePost(params.id, dto);
  }

  // * DELETE: Delete post specified by id
  @Delete(':id')
  @HttpCode(204)
  deletePost(@Param() params: IdParamDto) {
    return this.postsService.deletePost(params.id);
  }

  // * tests ================================================================
  @Post(':postId/comments')
  async createComment(
    @Param() params: PostIdParamDto,
    @Body('content') content: string,
  ) {
    const comment = await this.commentModel.create({
      content,
      postId: new Types.ObjectId(params.postId),
      commentatorInfo: { userId: 'test-user-id', userLogin: 'test-user-login' },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });

    return comment;
  }
}
