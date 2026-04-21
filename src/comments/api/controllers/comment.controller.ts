import { Controller, Get, Param } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CommentParams } from '../dto/comment-params.dto';
import { CommentsQueryService } from 'src/comments/application/services/comments-query.services';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentModel,
} from 'src/comments/domain/entities/comment.entity';

@Controller(API_ROUTES.comments)
export class CommentController {
  constructor(
    private commentsQueryService: CommentsQueryService,
    @InjectModel(Comment.name) private commentModel: CommentModel,
  ) {}

  // * Return comment by id
  @Get(':id')
  async getCommentById(@Param() params: CommentParams) {
    return this.commentsQueryService.getCommentById(params.id);
  }
}
