import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { mapToCommentOutput } from "../application/mappers/map-to-comment-output.mapper";
import { IPostCommentOutput } from "../../posts/application/output/post-comment.output";
import { ICommentsQueryRepo } from "comments/interfaces/ICommentsQueryRepo";

@injectable()
export class CommentsQueryRepo implements ICommentsQueryRepo {
  async getCommentsListById(
    commentId: string
  ): Promise<IPostCommentOutput | null> {
    const comment = await postCommentsCollection.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) return null;

    return mapToCommentOutput(comment);
  }
}
