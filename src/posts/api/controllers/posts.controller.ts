import { Body, Controller, HttpCode, Param, Post, Put } from '@nestjs/common';

import { PostsService } from 'src/posts/application/services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { API_ROUTES } from 'src/core/constants/api-routes';
import { PostViewModel } from '../dto/view-models/post.view-model';
import { PostParamsDto } from '../dto/post-params.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Controller(API_ROUTES.posts)
export class PostsController {
  constructor(private postsService: PostsService) {}

  // * POST: Create new post
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    const postDoc = await this.postsService.createPost(dto);

    const postOutput = PostViewModel.mapToViewModel(postDoc);

    return postOutput;
  }

  // * PUT: Update existing post by id with input model
  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param() params: PostParamsDto, @Body() dto: UpdatePostDto) {
    return await this.postsService.updatePost(params.id, dto);
  }

  // * DELETE: Delete post specified by id
}
