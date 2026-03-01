import { inject, injectable } from "inversify";

import { ApplicationResult } from "@core/result/application.result";
import { IPostCommentOutput } from "../../../posts/application/output/post-comment.output";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { NotFoundError } from "@core/errors/application.error";
import { Types } from "@core/di/types";
import { ICommentsQueryService } from "comments/interfaces/ICommentsQueryService";
import { ICommentsQueryRepo } from "comments/interfaces/ICommentsQueryRepo";

@injectable()
export class CommentsQueryService implements ICommentsQueryService {
  constructor(
    @inject(Types.ICommentsQueryRepo)
    private commentsQueryRepo: ICommentsQueryRepo
  ) {}

  async getCommentById(
    commentId: string,
    currentUserId?: string
  ): Promise<ApplicationResult<IPostCommentOutput | null>> {
    const comment = await this.commentsQueryRepo.findCommentById(
      commentId,
      currentUserId
    );

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
