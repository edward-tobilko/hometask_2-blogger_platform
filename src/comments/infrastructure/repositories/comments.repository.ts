import { injectable } from "inversify";
import { Types } from "mongoose";

import { ICommentsRepository } from "comments/application/interfaces/ICommentsRepository";
import {
  PostCommentsLean,
  PostCommentsModel,
} from "posts/infrastructure/schemas/post-comments.schema";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";
import { LikeStatus } from "@core/types/like-status.enum";
import {
  CommentLikeLean,
  CommentLikeModel,
} from "comments/infrastructure/schemas/comment-likes.schema";
import { RepositoryNotFoundError } from "@core/errors/application.error";

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async upsertCommentLikeStatus(
    likeStatus: LikeStatus,
    commentId: string,
    userId: string,
    likesChange: number,
    disLikesChange: number
  ): Promise<boolean> {
    // * Проверяем существование комментария внутри сессии
    const existingComment = await PostCommentsModel.findById(
      new Types.ObjectId(commentId)
    )
      .lean<PostCommentsLean>()
      .exec();

    if (!existingComment)
      throw new RepositoryNotFoundError("COMMENT NOT FOUND");

    // * Получаем текущий статус лайка пользователя (если есть)
    const existingLike = await CommentLikeModel.findOne({
      commentId: new Types.ObjectId(commentId),
      userId: new Types.ObjectId(userId),
    })
      .lean<CommentLikeLean>()
      .exec();

    const prevStatus = existingLike?.status || LikeStatus.None;

    if (prevStatus === likeStatus) return true; // * Ничего не делаем, но возвращаем успех

    // * Обновляем счетчики в комментарии
    await PostCommentsModel.updateOne(
      {
        _id: new Types.ObjectId(commentId),
      },
      {
        $inc: {
          "likesInfo.likesCount": likesChange,
          "likesInfo.dislikesCount": disLikesChange,
        },
      }
    ).exec();

    // * Сохраняем / обновляем статус лайка
    await CommentLikeModel.updateOne(
      {
        commentId: new Types.ObjectId(commentId),
        userId: new Types.ObjectId(userId),
      },
      {
        $set: { status: likeStatus },
      },
      {
        upsert: true, // * Создаем, если не существует
      }
    ).exec();

    return true;
  }

  async updateComment(dto: UpdateCommentDtoCommand): Promise<boolean> {
    if (!Types.ObjectId.isValid(dto.commentId)) return false;

    if (!dto.commentId) return false;

    const updateResult = await PostCommentsModel.updateOne(
      { _id: dto.commentId },
      { $set: { content: dto.content } }
    ).exec();

    return updateResult.matchedCount === 1;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const comment = await PostCommentsModel.deleteOne({
      _id: new Types.ObjectId(commentId),
    });

    return comment.deletedCount > 0; // true если удалено, false - если нет
  }
}

// ? оператор $inc: {} - для атомарного (на уровне БД) увеличения или уменьшения числовых полей, важен для лайков, счетчиков, просмотров и любой статистики. Если вместо $inc -> $set, то например, если 2 пользователя лайкнут одновременно → race condition → неправильный счет.

// ? Поэтому: параллельные апдейты не ломают счетчик, не нужны транзакции для простых кейсов, быстро.
