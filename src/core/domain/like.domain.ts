import { LikeStatus } from "@core/types/like-status.enum";

type LikeChange = {
  likesChange: number;
  disLikesChange: number;
};

export class LikeEntity {
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
