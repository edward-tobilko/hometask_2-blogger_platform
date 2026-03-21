import { injectable } from "inversify";
import { Types, ClientSession } from "mongoose";

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
import { ICommentsRepository } from "comments/application/interfaces/comments-repo.interface";
import { CommentEntity } from "comments/domain/entities/comment.entity";
import { CommentMapper } from "comments/domain/mappers/comment.mapper";

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async findById(commentId: string): Promise<CommentEntity | null> {
    if (!Types.ObjectId.isValid(commentId)) return null;

    const commentLean = await PostCommentsModel.findById(commentId)
      .lean<PostCommentsLean>()
      .exec();

    if (!commentLean) return null;

    return CommentMapper.toDomain(commentLean);
  }

  async save(commentEntity: CommentEntity): Promise<boolean> {
    const commentDb = CommentMapper.toDb(commentEntity);

    const result = await PostCommentsModel.updateOne(
      { _id: new Types.ObjectId(commentEntity.id) },
      { $set: commentDb }
    ).exec();

    return result.matchedCount === 1;
  }

  async findUserLikeStatus(
    commentId: string,
    userId: string
  ): Promise<LikeStatus | null> {
    // * Получаем текущий статус лайка пользователя (если есть)
    const existingLike = await CommentLikeModel.findOne({
      commentId: new Types.ObjectId(commentId),
      userId: new Types.ObjectId(userId),
    })
      .lean<CommentLikeLean>()
      .exec();

    return existingLike?.status || LikeStatus.None;
  }

  async upsertCommentLikeStatus(
    likeStatus: LikeStatus,
    commentId: string,
    userId: string,
    likesChange: number,
    disLikesChange: number,
    session: ClientSession
  ): Promise<boolean> {
    // * Обновляем счетчики в комментарии
    const updateCommentResult = await PostCommentsModel.updateOne(
      {
        _id: new Types.ObjectId(commentId),
      },
      {
        $inc: {
          "likesInfo.likesCount": likesChange,
          "likesInfo.dislikesCount": disLikesChange,
        },
      },
      session
    ).exec();

    if (updateCommentResult.matchedCount !== 1) {
      return false;
    }

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
        session,
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
