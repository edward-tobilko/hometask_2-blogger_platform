import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/repositories/comments.repo';
import { CommentDocument } from '../../domain/entities/comment.entity';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UpdateCommentDomainDto } from '../../domain/dto/update-comment.dto';

export class UpdateCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public dto: UpdateCommentDomainDto,
  ) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase implements ICommandHandler<
  UpdateCommentByIdCommand,
  void
> {
  constructor(private commentsRepo: CommentsRepository) {}

  // * private helper methods (Extract Method)
  private async findCommentOrFail(commentId: string): Promise<CommentDocument> {
    const commentInstance = await this.commentsRepo.findById(commentId);

    if (!commentInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This Comment with ID:${commentId} was not found`,
      });
    }

    return commentInstance;
  }
  async execute(command: UpdateCommentByIdCommand): Promise<void> {
    const { commentId, userId, dto } = command;

    const existingComment = await this.findCommentOrFail(commentId);

    if (existingComment.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "You can't edit someone else's comment",
      });
    }

    existingComment.updateComment(dto);

    await this.commentsRepo.save(existingComment);
  }
}
