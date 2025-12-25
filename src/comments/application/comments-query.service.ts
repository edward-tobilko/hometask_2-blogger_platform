import { IPostCommentOutput } from "../../posts/application/output/post-comment.output";
import { CommentQueryRepo } from "../repositories/comment-query.repository";

class CommentsQueryService {
  constructor(private commentsQueryRepo = new CommentQueryRepo()) {}

  async getCommentsById(commentId: string): Promise<IPostCommentOutput> {
    return await this.commentsQueryRepo.getCommentsByIdQueryRepo(commentId);
  }
}

export const commentsQueryService = new CommentsQueryService();
