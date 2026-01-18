import { ObjectId } from "mongodb";

import { mapToCommentOutput } from "../application/mappers/map-to-comment-output.mapper";
import { postCommentsCollection } from "../../db/mongo.db";
import { IPostCommentOutput } from "../../posts/application/output/post-comment.output";

export class CommentQueryRepo {
  async getCommentsByIdQueryRepo(
    commentId: string
  ): Promise<IPostCommentOutput | null> {
    const comment = await postCommentsCollection.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) return null;

    return mapToCommentOutput(comment);
  }
}
