import { Controller, Get, Param } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CommentParams } from '../dto/comment-params.dto';
import { CommentsQueryService } from 'src/comments/application/services/comments-query.services';

@Controller(API_ROUTES.comments)
export class CommentController {
  constructor(private commentsQueryService: CommentsQueryService) {}

  // * Return comment by id
  @Get(':id')
  async getCommentById(@Param() params: CommentParams) {
    return this.commentsQueryService.getCommentById(params.id);
  }
}
