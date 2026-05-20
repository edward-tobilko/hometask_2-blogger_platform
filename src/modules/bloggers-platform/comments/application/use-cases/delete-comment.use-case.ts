import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/repositories/comments.repo';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export class DeleteCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdUseCase implements ICommandHandler<
  DeleteCommentByIdCommand,
  void
> {
  constructor(private commentsRepo: CommentsRepository) {}

  async execute(command: DeleteCommentByIdCommand): Promise<void> {
    const { commentId, userId } = command;

    const existingComment = await this.commentsRepo.findById(commentId);

    if (!existingComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This Comment with ID:${commentId} was not found`,
      });
    } else if (existingComment.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "You can't edit someone else's comment",
      });
    }

    await this.commentsRepo.delete(commentId);
  }
}
