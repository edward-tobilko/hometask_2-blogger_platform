import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CommentViewModel } from '../dto/view-dto/comment.view-dto';
import { GetCommentByIdQueryHandler } from '../../application/queries/comments-query.services';
import { UpdateCommentByIdCommand } from '../../application/use-cases/update-comment.use-case';
import { CommentIdParam } from '../dto/input-dto/comment-id.input-dto';
import { UpdateCommentDto } from '../dto/input-dto/update-comment.input-dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import {
  CurrentUserFromRequest,
  CurrentUserOptionalFromRequest,
} from 'src/modules/user-accounts/guards/decorators/params/current-user.param-decorator';
import { DeleteCommentByIdCommand } from '../../application/use-cases/delete-comment.use-case';
import { UpdateCommentLikeStatusCommand } from '../../application/use-cases/update-comment-like-status.use-case';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { LikeStatusDto } from 'src/core/dto/like-status.dto';

@Controller(API_ROUTES.comments)
export class CommentController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  // * PUT: Make like / unlike / dislike / undislike operation
  @Put(':commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateCommentLikeStatus(
    @Param() params: CommentIdParam,
    @Body() dto: LikeStatusDto,
    @CurrentUserFromRequest()
    currentUser: { id: string },
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        params.commentId,
        currentUser.id,
        dto.likeStatus,
      ),
    );
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

  // * DELETE: Delete comment specified by id
  @Delete(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(
    @Param() params: CommentIdParam,
    @CurrentUserFromRequest()
    currentUser: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentByIdCommand(params.commentId, currentUser.id),
    );
  }

  // * Return comment by id
  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentById(
    @Param() params: CommentIdParam,
    @CurrentUserOptionalFromRequest()
    currentUser: { id: string } | null,
  ): Promise<CommentViewModel | null> {
    return this.queryBus.execute(
      new GetCommentByIdQueryHandler(params.commentId, currentUser?.id),
    );
  }
}
