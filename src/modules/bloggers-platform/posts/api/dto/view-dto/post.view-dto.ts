import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostDocument, PostLean } from '../../../domain/entities/post.entity';

// * Создаем отдельные классы во избежания вложенности аннонимных обьектов в аннонимных обьектах (это нужно если мы исп. swagger doc, так как он не умеет обрабатывать вложенные анонимные типы):

// * newestLikes: Array<{ ← анонимный объект внутри анонимного объекта
// * addedAt: string;
// * userId: string;
// * login: string;}>

class NewestLikeViewModel {
  addedAt!: string;
  userId!: string;
  login!: string;
}

class ExtendedLikesInfoViewModel {
  likesCount!: number;
  dislikesCount!: number;
  myStatus!: LikeStatus;
  newestLikes!: NewestLikeViewModel[];
}

export class PostViewModel {
  id!: string;
  title!: string;
  shortDescription!: string;
  content!: string;
  blogId!: string;
  blogName!: string;
  createdAt!: string;

  extendedLikesInfo!: ExtendedLikesInfoViewModel;

  static mapToViewModel(
    this: void, // не реальный параметр функции, просто аннотация для TypeScript / ESLint что бы не ругался
    post: PostDocument | PostLean,
    // myStatus: LikeStatus,
  ): PostViewModel {
    const dto = new PostViewModel();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt.toISOString(); // отдаем ту дату, которая в entity

    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus: LikeStatus.None, // пока что default (сделаем динамический, когда будет авторизация)

      newestLikes: post.extendedLikesInfo.newestLikes.map((like) => ({
        addedAt: like.addedAt.toISOString(),
        userId: like.userId.toString(),
        login: like.login,
      })),
    };

    return dto;
  }
}

// ? class-validator - проверяет данные на входе в API, до попадания в бизнес-логику. Так как мы исп. ValidationPipe мы можем безопасно доверять нашим свойствам: "!".
