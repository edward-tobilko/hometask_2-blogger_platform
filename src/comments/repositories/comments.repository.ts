import { ObjectId } from "mongodb";

import { postCommentsCollection } from "../../db/mongo.db";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { PostCommentDomain } from "../../posts/domain/post-comment.domain";

export class CommentsRepository {
  async getCommentDomainById(commentId: string): Promise<PostCommentDomain> {
    const result = await postCommentsCollection.findOne({
      _id: new ObjectId(commentId),
    });

    if (!result) {
      throw new RepositoryNotFoundError("commentId", "Comment is not exist!");
    }

    return PostCommentDomain.reconstitute({
      ...result,
    });
  }

  async deleteCommentRepo(commentId: string): Promise<void> {
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

  async updateCommentRepo(
    commentDomain: PostCommentDomain
  ): Promise<PostCommentDomain> {
    if (!commentDomain._id) {
      throw new RepositoryNotFoundError(
        "commentId",
        "Comment ID is not provided for update"
      );
    }

    const { _id, ...dtoToUpdate } = commentDomain;

    const updateResult = await postCommentsCollection.updateOne(
      { _id },
      { $set: dtoToUpdate }
    );

    if (updateResult.matchedCount < 1) {
      throw new RepositoryNotFoundError(
        "commentId",
        "Comment is not found in this post"
      );
    }

    return commentDomain;
  }
}
