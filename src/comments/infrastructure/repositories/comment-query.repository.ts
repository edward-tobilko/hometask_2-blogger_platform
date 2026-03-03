import { injectable } from "inversify";
import { Types } from "mongoose";

import { mapToCommentOutput } from "../../application/mappers/map-to-comment-output.mapper";
import { IPostCommentOutput } from "../../../posts/application/output/post-comment.output";
import { ICommentsQueryRepo } from "comments/application/interfaces/ICommentsQueryRepo";
import {
  PostCommentsLean,
  PostCommentsModel,
} from "posts/infrastructure/mongoose/post-comments.schema";
import { LikeStatus } from "@core/types/like-status.enum";
import {
  CommentLikeLean,
  CommentLikeModel,
} from "comments/infrastructure/schemas/comment-likes.schema";

@injectable()
export class CommentsQueryRepo implements ICommentsQueryRepo {
  async findCommentById(
    commentId: string,
    currentUserId?: string // * Опционально - для неавторизованных пользователей
  ): Promise<IPostCommentOutput | null> {
    if (!Types.ObjectId.isValid(commentId)) return null;

    // * Получаем коммент
    const comment = await PostCommentsModel.findById(commentId)
      .lean<PostCommentsLean>()
      .exec();

    if (!comment) return null;

    // * Получаем myStatus для текущего пользователя
    let myStatus = LikeStatus.None;

    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const currentUserLike = await CommentLikeModel.findOne({
        commentId: new Types.ObjectId(commentId),
        userId: new Types.ObjectId(currentUserId),
      })
        .lean<CommentLikeLean>()
        .exec();

      if (currentUserLike) {
        myStatus = currentUserLike.status;
      }
    }

    return mapToCommentOutput(comment, myStatus);
  }
}
