import { ForbiddenError } from "../../core/errors/application.error";
import { CommentQueryRepo } from "../repositories/comment-query.repository";
import { CommentsRepository } from "../repositories/comments.repository";

class CommentsService {
  constructor(
    private commentsRepo = new CommentsRepository(),
    private commentsQueryRepo = new CommentQueryRepo()
  ) {}

  async deleteCommentById(commentId: string, userId: string): Promise<void> {
    const comment =
      await this.commentsQueryRepo.getCommentsByIdQueryRepo(commentId); // 404 if not exist

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        "userId",
        "You can't delete someone else's comment"
      ); // 403
    }

    return await this.commentsRepo.deleteComment(commentId); // 204
  }
}

export const commentsService = new CommentsService();
