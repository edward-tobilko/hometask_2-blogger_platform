import { LikeStatus } from "@core/types/like-status.enum";
import { CommentLikeDocument } from "comments/infrastructure/mongoose/comment-likes.schema";

type LikeChange = {
  likesChange: number;
  disLikesChange: number;
};

export class CommentEntity {
  // * НЕ дублируем свойства, храним ссылку на mongoose document
  private constructor(private readonly document: CommentLikeDocument) {}

  // * Фабричный метод для востановления entity из документа БД
  static fromDocument(doc: CommentLikeDocument): CommentEntity {
    return new CommentEntity(doc);
  }

  static calculateLikeDislike(
    prevStatus: LikeStatus,
    nextStatus: LikeStatus
  ): LikeChange {
    if (prevStatus === nextStatus) {
      return { likesChange: 0, disLikesChange: 0 };
    }

    // * Вычисляем изменения счетчиков
    let likesChange = 0;
    let disLikesChange = 0;

    // * Убираем старый статус
    if (prevStatus === LikeStatus.Like) {
      likesChange = likesChange - 1;
    } else if (prevStatus === LikeStatus.Dislike) {
      disLikesChange = disLikesChange - 1;
    }

    // * Добавляем новый статус
    if (nextStatus === LikeStatus.Like) {
      likesChange = likesChange + 1;
    } else if (nextStatus === LikeStatus.Dislike) {
      disLikesChange = disLikesChange + 1;
    }

    return { likesChange, disLikesChange };
  }
}

/*
 * Доменная сущность комментария

 * ✅ Что она делает:
 * - Хранит бизнес-правила (кто может редактировать, удалять)
 * - Вычисляет изменения лайков
 * - Валидирует данные
 
 * ❌ Что она НЕ делает:
 * - Не знает о базе данных (это задача Repository)
 * - Не делает HTTP запросы (это задача Controller)
 */
