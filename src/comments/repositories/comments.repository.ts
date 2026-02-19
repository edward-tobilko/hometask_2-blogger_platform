import { injectable } from "inversify";
import { Types } from "mongoose";

// import { PostCommentDomain } from "../../posts/domain/post-comment.domain";
import { ICommentsRepository } from "comments/interfaces/ICommentsRepository";
import { PostCommentsModel } from "posts/mongoose/post-comments.schema";
import { UpdateCommentDtoCommand } from "comments/application/commands/update-comment-dto.command";
import { LikeStatus } from "@core/types/like-status.enum";
import {
  CommentLikeLean,
  CommentLikeModel,
} from "comments/mongoose/comment-likes.schema";

@injectable()
export class CommentsRepository implements ICommentsRepository {
  // async getCommentDomainById(
  //   commentId: string
  // ): Promise<PostCommentDomain | null> {
  //   const result = await PostCommentsModel.findOne({
  //     _id: new Types.ObjectId(commentId),
  //   });

  //   if (!result) return null;

  //   return PostCommentDomain.reconstitute({
  //     ...result,
  //   });
  // }

  async deleteCommentById(commentId: string): Promise<boolean> {
    const comment = await PostCommentsModel.deleteOne({
      _id: new Types.ObjectId(commentId),
    });

    return comment.deletedCount > 0; // true если удалено, false - если нет
  }

  async updateCommentById(dto: UpdateCommentDtoCommand): Promise<boolean> {
    if (!Types.ObjectId.isValid(dto.commentId)) return false;

    if (!dto.commentId) return false;

    const updateResult = await PostCommentsModel.updateOne(
      { _id: dto.commentId },
      { $set: { content: dto.content } }
    ).exec();

    return updateResult.matchedCount === 1;
  }

  async updateCommentLikeStatusById(dto: {
    likeStatus: LikeStatus;
    commentId: string;
    userId: string;
  }): Promise<boolean> {
    if (
      !Types.ObjectId.isValid(dto.commentId) ||
      !Types.ObjectId.isValid(dto.userId)
    )
      return false;

    // * Проверяем существование комментария
    const existingComment = await PostCommentsModel.findById(
      new Types.ObjectId(dto.commentId)
    )
      .lean<CommentLikeLean>()
      .exec();

    if (!existingComment) return false;

    // *  Получаем текущий статус пользователя (если есть)
    const existingLike = await CommentLikeModel.findOne({
      commentId: new Types.ObjectId(dto.commentId),
      userId: new Types.ObjectId(dto.userId),
    })
      .lean<CommentLikeLean>()
      .exec();

    const prevStatus = existingLike?.status || LikeStatus.None;

    if (prevStatus === dto.likeStatus) return true; // * Ничего не делаем, но возвращаем успех

    // * Вычисляем изменения счетчиков
    let likesChange = 0;
    let disLikesChange = 0;

    // * Убираем старый статус
    if (prevStatus === LikeStatus.Like) {
      likesChange -= 1;
    } else if (prevStatus === LikeStatus.Dislike) {
      disLikesChange -= 1;
    }

    // * Добавляем новый статус
    if (dto.likeStatus === LikeStatus.Like) {
      likesChange += 1;
    } else if (dto.likeStatus === LikeStatus.Dislike) {
      disLikesChange += 1;
    }

    // * Обновляем счетчики в комментарии
    await PostCommentsModel.updateOne(
      {
        _id: new Types.ObjectId(dto.commentId),
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
        commentId: new Types.ObjectId(dto.commentId),
        userId: new Types.ObjectId(dto.userId),
      },
      {
        status: dto.likeStatus,
      },
      {
        upsert: true, // * Создаем, если не существует
      }
    ).exec();

    return true;
  }
}

// ? оператор $inc: {} - для атомарного (на уровне БД) увеличения или уменьшения числовых полей, важен для лайков, счетчиков, просмотров и любой статистики. Если вместо $inc -> $set, то например, если 2 пользователя лайкнут одновременно → race condition → неправильный счет.

// ? Поэтому: параллельные апдейты не ломают счетчик, не нужны транзакции для простых кейсов, быстро.
