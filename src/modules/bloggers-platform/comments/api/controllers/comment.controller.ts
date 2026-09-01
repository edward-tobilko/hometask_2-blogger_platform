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
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CommentViewModel } from '../dto/view-dto/comment.view-dto';
import { GetCommentByIdQueryHandler } from '../../application/queries/comments-query.services';
import { UpdateCommentByIdCommand } from '../../application/use-cases/update-comment.use-case';
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
import { ApiUpdateLikeStatusForCommentSwagger } from '../decorators/swagger/update-like-status-for-comment-swagger.decorator';
import { ApiUpdateCommentByIdSwagger } from '../decorators/swagger/update-comment-swagger.decorator';
import { ApiDeleteCommentSwagger } from '../decorators/swagger/delete-comment-swagger.decorator';
import { ApiGetCommentByIdSwagger } from '../decorators/swagger/get-comment-swagger.decorator';
import { IdParamDto } from 'src/core/dto/param.dto';
import { UuidValidationPipe } from 'src/core/pipes/uuid-validation.pipe';

@ApiTags('Comments')
@SkipThrottle()
@Controller(API_ROUTES.comments)
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @ApiUpdateLikeStatusForCommentSwagger(
    'Make like / unlike / dislike / undislike operation',
  )
  @Put(':commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateCommentLikeStatus(
    @Param('commentId', UuidValidationPipe) commentId: string,
    @Body() dto: LikeStatusDto,
    @CurrentUserFromRequest()
    currentUser: { id: string },
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        commentId,
        currentUser.id,
        dto.likeStatus,
      ),
    );
  }

  @ApiUpdateCommentByIdSwagger('Update existing comment by id with input model')
  @Put(':commentId')
  @HttpCode(204) // success
  @UseGuards(JwtAuthGuard) // if error = 401
  async updateCommentById(
    @Param('commentId', UuidValidationPipe) commentId: string,
    @Body() dto: UpdateCommentDto, // if error = 400
    @CurrentUserFromRequest() // if error = 403
    currentUser: { id: string },
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentByIdCommand(commentId, currentUser.id, dto),
    );
  }

  @ApiDeleteCommentSwagger('Delete comment specified by id')
  @Delete(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(
    @Param('commentId', UuidValidationPipe) commentId: string,
    @CurrentUserFromRequest()
    currentUser: { id: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentByIdCommand(commentId, currentUser.id),
    );
  }

  @ApiGetCommentByIdSwagger('Return comment by id')
  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentById(
    @Param() params: IdParamDto,
    @CurrentUserOptionalFromRequest()
    currentUser: { id: string } | null,
  ): Promise<CommentViewModel | null> {
    const query = new GetCommentByIdQueryHandler(params.id, currentUser?.id);

    return this.queryBus.execute(query);
  }
}
