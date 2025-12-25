import { ObjectId } from "mongodb";

import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { mapToCommentOutput } from "../application/mappers/map-to-comment-output.mapper";
import { postCommentsCollection } from "../../db/mongo.db";
import { IPostCommentOutput } from "../../posts/application/output/post-comment.output";

export class CommentQueryRepo {
  async getCommentsByIdQueryRepo(
    commentId: string
  ): Promise<IPostCommentOutput> {
    const comment = await postCommentsCollection.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) {
      throw new RepositoryNotFoundError(
        "commentId",
        "Comment ID is not exist!",
        404
      );
    }

    return mapToCommentOutput(comment);
  }
}
