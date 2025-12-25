import { ObjectId } from "mongodb";
import { postCommentsCollection } from "../../db/mongo.db";
import { RepositoryNotFoundError } from "../../core/errors/application.error";

export class CommentsRepository {
  async deleteComment(commentId: string): Promise<void> {
    const comment = await postCommentsCollection.deleteOne({
      _id: new ObjectId(commentId),
    });

    if (comment.deletedCount < 1) {
      throw new RepositoryNotFoundError(
        "commentId",
        "Comment ID is not exist!"
      );
    }

    return;
  }
}
