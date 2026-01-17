import { ApplicationResult } from "@core/result/application.result";
import { IPostCommentOutput } from "../../posts/application/output/post-comment.output";
import { CommentQueryRepo } from "../repositories/comment-query.repository";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { NotFoundError } from "@core/errors/application.error";

class CommentsQueryService {
  constructor(private commentsQueryRepo = new CommentQueryRepo()) {}

  async getCommentsById(
    commentId: string
  ): Promise<ApplicationResult<IPostCommentOutput | null>> {
    const comment =
      await this.commentsQueryRepo.getCommentsByIdQueryRepo(commentId);

    if (!comment) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Comment is not found", "commentId")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: comment,
      extensions: [],
    });
  }
}

export const commentsQueryService = new CommentsQueryService();
