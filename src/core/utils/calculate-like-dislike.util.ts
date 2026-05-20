import { LikeStatus } from '../enums/like-status.enum';

export const calculateLikeDislike = (
  prevLikeStatus: LikeStatus,
  nextLikeStatus: LikeStatus,
): { likes: number; disLikes: number } => {
  // * Вычисляем изменения счетчиков
  let likes = 0;
  let disLikes = 0;

  if (prevLikeStatus === nextLikeStatus) {
    return { likes: 0, disLikes: 0 };
  }

  // * Убираем старый статус
  if (prevLikeStatus === LikeStatus.Like) {
    likes = likes - 1;
  } else if (prevLikeStatus === LikeStatus.Dislike) {
    disLikes = disLikes - 1;
  }

  // * Добавляем новый статус
  if (nextLikeStatus === LikeStatus.Like) {
    likes = likes + 1;
  } else if (nextLikeStatus === LikeStatus.Dislike) {
    disLikes = disLikes + 1;
  }

  return { likes, disLikes };
};
