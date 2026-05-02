import { Controller, Get, Param } from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CommentsQueryService } from 'src/modules/bloggers-platform/comments/application/services/comments-query.services';
import { CommentViewModel } from '../dto/view-dto/comment.view-dto';
import { BlogIdParamDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blog-params.input-dto';

@Controller(API_ROUTES.comments)
export class CommentController {
  constructor(private commentsQueryService: CommentsQueryService) {}

  // * Return comment by id
  @Get(':id')
  async getCommentById(
    @Param() params: BlogIdParamDto,
  ): Promise<CommentViewModel | null> {
    return this.commentsQueryService.getCommentById(params.id);
  }
}
