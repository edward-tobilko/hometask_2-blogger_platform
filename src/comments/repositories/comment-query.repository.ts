import { injectable } from "inversify";
import { Types } from "mongoose";

import { mapToCommentOutput } from "../application/mappers/map-to-comment-output.mapper";
import { IPostCommentOutput } from "../../posts/application/output/post-comment.output";
import { ICommentsQueryRepo } from "comments/interfaces/ICommentsQueryRepo";
import { PostCommentsModel } from "posts/mongoose/post-comments.schema";

@injectable()
export class CommentsQueryRepo implements ICommentsQueryRepo {
  async getCommentsListById(
    commentId: string
  ): Promise<IPostCommentOutput | null> {
    const comment = await PostCommentsModel.findOne({
      _id: new Types.ObjectId(commentId),
    });

    if (!comment) return null;

    return mapToCommentOutput(comment);
  }
}
