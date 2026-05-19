import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CommentViewModel } from '../dto/view-dto/comment.view-dto';
import { BlogIdParamDto } from 'src/modules/bloggers-platform/blogs/api/dto/input-dto/blog-params.input-dto';
import { GetCommentByIdQueryHandler } from '../../application/queries/comments-query.services';
import { UpdateCommentByIdCommand } from '../../application/use-cases/update-comment.use-case';
import { CommentIdParam } from '../dto/input-dto/comment-id.input-dto';
import { UpdateCommentDto } from '../dto/input-dto/update-comment.input-dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CurrentUserFromRequest } from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';

@Controller(API_ROUTES.comments)
export class CommentController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  // * Return comment by id
  @Get(':id')
  async getCommentById(
    @Param() params: BlogIdParamDto,
  ): Promise<CommentViewModel | null> {
    return this.queryBus.execute(new GetCommentByIdQueryHandler(params.id));
  }

  // * PUT: Update existing comment by id with input model
  @Put(':commentId')
  @HttpCode(204) // success
  @UseGuards(JwtAuthGuard) // if error = 401
  async updateCommentById(
    @Param() params: CommentIdParam,
    @Body() dto: UpdateCommentDto, // if error = 400
    @CurrentUserFromRequest() // if error = 403
    currentUser: { id: string },
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentByIdCommand(params.commentId, currentUser.id, dto),
    );
  }
}
