import { PostCommentDomain } from "posts/domain/post-comment.domain";

export interface ICommentsRepository {
  getCommentDomainById(commentId: string): Promise<PostCommentDomain | null>;

  deleteCommentById(commentId: string): Promise<boolean>;

  updateCommentById(commentDomain: PostCommentDomain): Promise<boolean>;
}
