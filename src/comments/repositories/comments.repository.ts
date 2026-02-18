import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { PostCommentDomain } from "../../posts/domain/post-comment.domain";
import { ICommentsRepository } from "comments/interfaces/ICommentsRepository";

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async getCommentDomainById(
    commentId: string
  ): Promise<PostCommentDomain | null> {
    const result = await postCommentsCollection.findOne({
      _id: new ObjectId(commentId),
    });

    if (!result) return null;

    return PostCommentDomain.reconstitute({
      ...result,
    });
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    const comment = await postCommentsCollection.deleteOne({
      _id: new ObjectId(commentId),
    });

    return comment.deletedCount > 0; // true если удалено, false если нет
  }

  async updateCommentById(commentDomain: PostCommentDomain): Promise<boolean> {
    if (!commentDomain._id) return false;

    const { _id, ...dtoToUpdate } = commentDomain;

    const updateResult = await postCommentsCollection.updateOne(
      { _id },
      { $set: dtoToUpdate }
    );

    return updateResult.matchedCount > 0;
  }
}
