import { Controller, Get, Param } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CommentParams } from '../dto/comment-params.dto';
import { CommentsQueryService } from 'src/modules/bloggers-platform/comments/application/services/comments-query.services';
import { CommentViewModel } from '../dto/view/comment.view';

@Controller(API_ROUTES.comments)
export class CommentController {
  constructor(private commentsQueryService: CommentsQueryService) {}

  // * Return comment by id
  @Get(':id')
  async getCommentById(
    @Param() params: CommentParams,
  ): Promise<CommentViewModel | null> {
    return this.commentsQueryService.getCommentById(params.id);
  }
}
