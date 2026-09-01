import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';
import { UpdateCommentDomainDto } from '../../domain/dto/update-comment.dto';
import { CommentsSqlRepository } from '../../infrastructure/sql/repositories/comments-sql.repo';
import { CommentOrmEntity } from '../../infrastructure/sql/schemas/comment-orm.entity';

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
  constructor(private commentsRepo: CommentsSqlRepository) {}

  // * private helper methods (Extract Method)
  private async findCommentOrFail(
    commentId: string,
  ): Promise<CommentOrmEntity> {
    const commentInstance = await this.commentsRepo.findById(commentId);

    if (!commentInstance) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `This comment with ID:${commentId} was not found`,
      });
    }

    return commentInstance;
  }

  async execute(command: UpdateCommentByIdCommand): Promise<void> {
    const { commentId, userId, dto } = command;

    const existingComment = await this.findCommentOrFail(commentId);

    if (existingComment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "You can't edit someone else's comment",
      });
    }

    existingComment.content = dto.content;

    await this.commentsRepo.save(existingComment);
  }
}
