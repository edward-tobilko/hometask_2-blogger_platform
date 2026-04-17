import { LikeStatus } from 'src/core/enums/enums';
import { PostDocument, PostLean } from 'src/posts/domain/post.entity';

export class PostViewModel {
  id!: string;
  title!: string;
  shortDescription!: string;
  content!: string;
  blogId!: string;
  blogName!: string;
  createdAt!: string;

  extendedLikesInfo!: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;

    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }>;
  };

  static mapToViewModel(
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
